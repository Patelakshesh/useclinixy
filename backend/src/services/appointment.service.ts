import Appointment, { IAppointment } from '../models/appointment.model';
import Doctor from '../models/doctor.model';
import DoctorLeave from '../models/doctorLeave.model';

export const createAppointment = async (clinicId: string, data: Partial<IAppointment>) => {
  // 1. Validate Doctor Schedule and Leaves
  const doctor = await Doctor.findOne({ _id: data.doctorId, clinicId });
  if (!doctor) throw new Error('Doctor not found');

  if (!data.isEmergency) {
    // Check Leaves
    const isLeave = await DoctorLeave.findOne({
      doctorId: data.doctorId,
      clinicId,
      status: 'APPROVED',
      startDate: { $lte: data.appointmentDate },
      endDate: { $gte: data.appointmentDate },
    });
    if (isLeave) throw new Error('Doctor is on leave on this date');

    // Check Schedule (Day of week)
    if (data.appointmentDate && data.appointmentTime) {
      const dateObj = new Date(data.appointmentDate);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = days[dateObj.getUTCDay()];

      const daySchedule = doctor.schedule?.find((s: any) => s.day === dayName);
      if (!daySchedule || !daySchedule.isWorkingDay) {
        throw new Error(`Doctor does not work on ${dayName}s`);
      }

      // Check if time falls within a shift
      const appointmentTimeStr = data.appointmentTime; // e.g., "14:30"
      const isValidTime = daySchedule.shifts.some((shift: any) => {
        return appointmentTimeStr >= shift.startTime && appointmentTimeStr <= shift.endTime;
      });

      if (!isValidTime) {
        throw new Error('Appointment time is outside doctor working hours or during a break');
      }
    }

    // 2. Check double booking manually for friendly error message
    const existing = await Appointment.findOne({
      doctorId: data.doctorId,
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      status: { $ne: 'CANCELLED' }
    });

    if (existing) {
      throw new Error('Doctor is already booked for this time slot');
    }
  }

  // 3. Dynamic Fee Calculation
  if (data.feesApplied === undefined) {
    let fees = doctor.newPatientFee;
    
    if (data.isEmergency) {
      fees = doctor.emergencyFee;
    } else {
      // Check if old patient
      const pastVisits = await Appointment.countDocuments({ 
        patientId: data.patientId, 
        clinicId, 
        status: { $in: ['COMPLETED', 'CONFIRMED'] } 
      });
      if (pastVisits > 0) {
        fees = doctor.oldPatientFee;
      }
    }
    data.feesApplied = fees;
  }

  const appointment = new Appointment({ ...data, clinicId });
  return await appointment.save();
};

export const getAppointments = async (clinicId: string, filter: any = {}, skip = 0, limit = 10) => {
  const query = { clinicId, ...filter };
  const [data, total] = await Promise.all([
    Appointment.find(query)
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name mobileNumber age gender bloodGroup')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Appointment.countDocuments(query),
  ]);
  return { data, total };
};

export const getCalendarAppointments = async (clinicId: string, startDate: string, endDate: string, doctorId?: string) => {
  const query: any = {
    clinicId,
    appointmentDate: { $gte: startDate, $lte: endDate }
  };
  if (doctorId) query.doctorId = doctorId;

  return await Appointment.find(query)
    .populate('doctorId', 'name specialization')
    .populate('patientId', 'name mobileNumber age gender bloodGroup')
    .sort({ appointmentDate: 1, appointmentTime: 1 });
};

export const updateAppointmentStatus = async (clinicId: string, id: string, status: string) => {
  return await Appointment.findOneAndUpdate(
    { _id: id, clinicId },
    { $set: { status } },
    { new: true, runValidators: true }
  );
};

export const deleteAppointment = async (clinicId: string, id: string) => {
  return await Appointment.findOneAndDelete({ _id: id, clinicId });
};

export const updateAppointment = async (clinicId: string, id: string, data: Partial<IAppointment>) => {
  // Validate Schedule if Date/Time/Doctor changed
  if (data.doctorId || data.appointmentDate || data.appointmentTime) {
    const appointmentToUpdate = await Appointment.findById(id);
    const doctorIdToCheck = data.doctorId || appointmentToUpdate?.doctorId;
    const dateToCheck = data.appointmentDate || appointmentToUpdate?.appointmentDate;
    const timeToCheck = data.appointmentTime || appointmentToUpdate?.appointmentTime;

    if (doctorIdToCheck && dateToCheck && timeToCheck) {
      const doctor = await Doctor.findOne({ _id: doctorIdToCheck, clinicId });
      if (!doctor) throw new Error('Doctor not found');

      // Check Leaves
      const isLeave = await DoctorLeave.findOne({
        doctorId: doctorIdToCheck,
        clinicId,
        status: 'APPROVED',
        startDate: { $lte: dateToCheck },
        endDate: { $gte: dateToCheck },
      });
      if (isLeave) throw new Error('Doctor is on leave on this date');

      // Check Schedule
      const dateObj = new Date(dateToCheck);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = days[dateObj.getUTCDay()];

      const daySchedule = doctor.schedule?.find((s: any) => s.day === dayName);
      if (!daySchedule || !daySchedule.isWorkingDay) {
        throw new Error(`Doctor does not work on ${dayName}s`);
      }

      const isValidTime = daySchedule.shifts.some((shift: any) => {
        return timeToCheck >= shift.startTime && timeToCheck <= shift.endTime;
      });

      if (!isValidTime) {
        throw new Error('Appointment time is outside doctor working hours or during a break');
      }
    }

    // Check double booking
    const existing = await Appointment.findOne({
      _id: { $ne: id },
      doctorId: data.doctorId,
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      status: { $ne: 'CANCELLED' }
    });

    if (existing) {
      throw new Error('Doctor is already booked for this time slot');
    }
  }

  return await Appointment.findOneAndUpdate(
    { _id: id, clinicId },
    { $set: data },
    { new: true, runValidators: true }
  );
};
