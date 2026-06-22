import { Request, Response, NextFunction } from 'express';
import Clinic from '../models/clinic.model';
import Doctor from '../models/doctor.model';
import Patient from '../models/patient.model';
import Appointment from '../models/appointment.model';
import Subscription from '../models/subscription.model';
import SubscriptionPlan from '../models/subscriptionPlan.model';
import { sendWhatsAppMessage } from '../services/whatsapp.service';

// Helper to check if clinic has a feature
const checkClinicFeature = async (clinicId: string, featureName: 'hasOnlineBooking' | 'hasWhatsApp'): Promise<boolean> => {
  let hasFeature = false;
  const subscription = await Subscription.findOne({ clinicId, status: 'ACTIVE' }).populate('planId');
  
  if (subscription) {
    hasFeature = (subscription.planId as any).features[featureName];
  } else {
    const starterPlan = await SubscriptionPlan.findOne({ name: 'Starter' });
    hasFeature = starterPlan?.features?.[featureName] || false;
  }
  return hasFeature;
};

// Helper to find a clinic by either its _id or subdomain (slug)
const findClinic = async (identifier: string) => {
  const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);
  return await Clinic.findOne(isObjectId ? { _id: identifier } : { subdomain: identifier });
};

export const getClinicDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { clinicId } = req.params;
    
    const clinic = await findClinic(clinicId);
    if (!clinic || clinic.status === 'SUSPENDED') {
      res.status(404).json({ success: false, message: 'Clinic not found or suspended.' });
      return;
    }

    // Check feature access using the resolved internal _id
    const hasOnlineBooking = await checkClinicFeature(clinic.id, 'hasOnlineBooking');
    if (!hasOnlineBooking) {
      res.status(403).json({ success: false, message: 'This clinic does not have online booking enabled.' });
      return;
    }

    res.status(200).json({ success: true, data: {
      _id: clinic._id,
      name: clinic.name,
      subdomain: clinic.subdomain,
      address: clinic.address,
      status: clinic.status
    } });
  } catch (error) {
    next(error);
  }
};

export const getClinicDoctors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { clinicId } = req.params;
    
    const clinic = await findClinic(clinicId);
    if (!clinic) {
      res.status(404).json({ success: false, message: 'Clinic not found' });
      return;
    }

    const hasOnlineBooking = await checkClinicFeature(clinic.id, 'hasOnlineBooking');
    if (!hasOnlineBooking) {
      res.status(403).json({ success: false, message: 'Online booking disabled.' });
      return;
    }

    const doctors = await Doctor.find({ clinicId: clinic._id, status: 'ACTIVE' }).select('name specialization consultationFees schedule');
    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    next(error);
  }
};

export const getBookedSlots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { clinicId } = req.params;
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      res.status(400).json({ success: false, message: 'doctorId and date are required' });
      return;
    }

    const clinic = await findClinic(clinicId);
    if (!clinic) {
      res.status(404).json({ success: false, message: 'Clinic not found' });
      return;
    }

    const appointments = await Appointment.find({
      clinicId: clinic._id,
      doctorId: doctorId as string,
      appointmentDate: date as string,
      status: { $ne: 'CANCELLED' }
    }).select('appointmentTime');

    const bookedTimes = appointments.map(a => a.appointmentTime);
    res.status(200).json({ success: true, data: bookedTimes });
  } catch (error) {
    next(error);
  }
};

export const bookPublicAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { clinicId } = req.params;
    const { doctorId, appointmentDate, appointmentTime, patientName, patientMobile, age, gender } = req.body;

    const clinic = await findClinic(clinicId);
    if (!clinic) {
      res.status(404).json({ success: false, message: 'Clinic not found' });
      return;
    }

    const hasOnlineBooking = await checkClinicFeature(clinic.id, 'hasOnlineBooking');
    if (!hasOnlineBooking) {
      res.status(403).json({ success: false, message: 'Online booking disabled.' });
      return;
    }

    // 1. Verify Doctor Schedule (Simple check)
    const existing = await Appointment.findOne({
      doctorId,
      appointmentDate,
      appointmentTime,
      status: { $ne: 'CANCELLED' }
    });

    if (existing) {
      res.status(409).json({ success: false, message: 'This time slot is already booked.' });
      return;
    }

    // 2. Find or Create Patient
    let patient = await Patient.findOne({ clinicId: clinic._id, mobileNumber: patientMobile });
    if (!patient) {
      patient = new Patient({
        clinicId: clinic._id,
        name: patientName,
        mobileNumber: patientMobile,
        age: age || 25,
        gender: gender || 'OTHER'
      });
      await patient.save();
    }

    // 3. Create Appointment
    const appointment = new Appointment({
      clinicId: clinic._id,
      patientId: patient._id,
      doctorId,
      appointmentDate,
      appointmentTime,
      status: 'CONFIRMED' // Public bookings are auto-confirmed for now
    });
    
    await appointment.save();

    // 4. Send WhatsApp Confirmation
    const hasWhatsApp = await checkClinicFeature(clinic.id, 'hasWhatsApp');
    if (hasWhatsApp) {
      const doctor = await Doctor.findById(doctorId);
      const dateStr = new Date(appointmentDate).toLocaleDateString();
      const msg = `Hello ${patient.name}, your online booking with Dr. ${doctor?.name} is CONFIRMED for ${dateStr} at ${appointmentTime}. Reply STOP to unsubscribe.`;
      
      // Fire and forget
      sendWhatsAppMessage(patient.mobileNumber, msg).catch(console.error);
    }

    res.status(201).json({ success: true, data: appointment, message: 'Appointment booked successfully!' });
  } catch (error) {
    next(error);
  }
};
