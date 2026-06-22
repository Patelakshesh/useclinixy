import { Request, Response, NextFunction } from 'express';
import * as appointmentService from '../services/appointment.service';
import { sendWhatsAppMessage } from '../services/whatsapp.service';
import Subscription from '../models/subscription.model';
import SubscriptionPlan from '../models/subscriptionPlan.model';
import Patient from '../models/patient.model';
import Doctor from '../models/doctor.model';
import { logAudit } from '../utils/auditLog.util';

export const createAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const appointment = await appointmentService.createAppointment(clinicId, req.body);
    
    // Log the creation
    logAudit(req.user?.userId!, 'APPOINTMENT_CREATED', { appointmentId: (appointment as any)._id, patientId: appointment.patientId }, clinicId, req.ip);

    // Send WhatsApp Message async (don't block response)
    (async () => {
      try {
        // 1. Check if clinic has WhatsApp feature enabled
        let hasWhatsApp = false;
        const subscription = await Subscription.findOne({ clinicId, status: 'ACTIVE' }).populate('planId');
        if (subscription) {
          hasWhatsApp = (subscription.planId as any).features.hasWhatsApp;
        } else {
          // Trial -> Starter Plan features
          const starterPlan = await SubscriptionPlan.findOne({ name: 'Starter' });
          hasWhatsApp = starterPlan?.features?.hasWhatsApp || false;
        }

        if (hasWhatsApp) {
          const patient = await Patient.findById(appointment.patientId);
          const doctor = await Doctor.findById(appointment.doctorId);

          if (patient?.mobileNumber) {
            const dateStr = new Date(appointment.appointmentDate).toLocaleDateString();
            const message = `Hello ${patient.name}, your appointment with Dr. ${doctor?.name} is confirmed for ${dateStr} at ${appointment.appointmentTime}. Reply STOP to unsubscribe.`;
            await sendWhatsAppMessage(patient.mobileNumber, message);
          }
        }
      } catch (err) {
        console.error('WhatsApp Reminder Error:', err);
      }
    })();

    res.status(201).json({ success: true, data: appointment, message: 'Appointment created successfully' });
  } catch (error: any) {
    if (error.message === 'Doctor is already booked for this time slot') {
      res.status(409).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const getAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const page = parseInt((req.query.page as string) as string) || 1;
    const limit = parseInt((req.query.limit as string) as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if ((req.query.date as string)) filter.appointmentDate = (req.query.date as string);
    if ((req.query.status as string)) filter.status = (req.query.status as string);

    // RBAC: If logged in as Doctor, they can ONLY see their own appointments
    if (req.user?.role === 'DOCTOR' && req.user?.doctorId) {
      filter.doctorId = req.user.doctorId;
    } else if ((req.query.doctorId as string)) {
      filter.doctorId = (req.query.doctorId as string);
    }

    // Fix P2-3: Support patient name search via lookup
    let patientIdFilter: string[] | null = null;
    if ((req.query.search as string)) {
      const matchingPatients = await Patient.find({
        clinicId,
        name: { $regex: (req.query.search as string), $options: 'i' }
      }).select('_id');
      patientIdFilter = matchingPatients.map((p: any) => p._id.toString());
      if (patientIdFilter.length > 0) {
        filter.patientId = { $in: patientIdFilter };
      } else {
        // No matching patients → return empty result fast
        res.status(200).json({ success: true, data: [], pagination: { total: 0, page, limit, pages: 0 } });
        return;
      }
    }

    const { data, total } = await appointmentService.getAppointments(clinicId, filter, skip, limit);
    res.status(200).json({
      success: true,
      data,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// Fix P2-4: Delete appointment permanently
export const deleteAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const deleted = await appointmentService.deleteAppointment(clinicId, (req.params.id as string));
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }
    logAudit(req.user?.userId!, 'APPOINTMENT_DELETED', { appointmentId: (req.params.id as string) }, clinicId, req.ip);
    res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getCalendarAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const { startDate, endDate, doctorId } = req.query as { startDate: string, endDate: string, doctorId?: string };
    
    if (!startDate || !endDate) {
      res.status(400).json({ success: false, message: 'startDate and endDate are required' });
      return;
    }

    let finalDoctorId = doctorId;
    if (req.user?.role === 'DOCTOR' && req.user?.doctorId) {
      finalDoctorId = req.user.doctorId;
    }

    const data = await appointmentService.getCalendarAppointments(clinicId, startDate, endDate, finalDoctorId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const appointment = await appointmentService.updateAppointmentStatus(clinicId, (req.params.id as string), req.body.status);
    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    // Log the status update
    logAudit(req.user?.userId!, `APPOINTMENT_${req.body.status}`, { appointmentId: (appointment as any)._id, patientId: appointment.patientId }, clinicId, req.ip);

    // Send WhatsApp Message async
    (async () => {
      try {
        let hasWhatsApp = false;
        const subscription = await Subscription.findOne({ clinicId, status: 'ACTIVE' }).populate('planId');
        if (subscription) {
          hasWhatsApp = (subscription.planId as any).features.hasWhatsApp;
        } else {
          const starterPlan = await SubscriptionPlan.findOne({ name: 'Starter' });
          hasWhatsApp = starterPlan?.features?.hasWhatsApp || false;
        }

        if (hasWhatsApp) {
          const patient = await Patient.findById(appointment.patientId);
          const doctor = await Doctor.findById(appointment.doctorId);

          if (patient?.mobileNumber) {
            let message = '';
            if (req.body.status === 'CANCELLED') {
              message = `Hi ${patient.name}, your appointment with Dr. ${doctor?.name} on ${new Date(appointment.appointmentDate).toLocaleDateString()} has been CANCELLED. Please contact the clinic to reschedule.`;
            } else if (req.body.status === 'COMPLETED') {
              message = `Hi ${patient.name}, thank you for visiting Dr. ${doctor?.name}. We hope you had a great experience!`;
            }

            if (message) {
              await sendWhatsAppMessage(patient.mobileNumber, message);
            }
          }
        }
      } catch (err) {
        console.error('WhatsApp Reminder Error:', err);
      }
    })();

    res.status(200).json({ success: true, data: appointment, message: 'Status updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const appointment = await appointmentService.updateAppointment(clinicId, (req.params.id as string), req.body);
    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    logAudit(req.user?.userId!, 'APPOINTMENT_UPDATED', { appointmentId: (appointment as any)._id, patientId: appointment.patientId }, clinicId, req.ip);

    res.status(200).json({ success: true, data: appointment, message: 'Appointment updated successfully' });
  } catch (error: any) {
    if (error.message === 'Doctor is already booked for this time slot') {
      res.status(409).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};
