import Prescription, { IPrescription } from '../models/prescription.model';

export const createPrescription = async (clinicId: string, data: Partial<IPrescription>) => {
  const existing = await Prescription.findOne({ appointmentId: data.appointmentId, clinicId });
  if (existing) {
    throw new Error('A prescription already exists for this appointment');
  }
  const prescription = new Prescription({ ...data, clinicId });
  return await prescription.save();
};

export const getPrescriptionByAppointment = async (clinicId: string, appointmentId: string) => {
  return await Prescription.findOne({ appointmentId, clinicId })
    .populate('patientId', 'name age gender mobileNumber bloodGroup address')
    .populate('doctorId', 'name specialization qualification');
};

export const getPatientPrescriptions = async (clinicId: string, patientId: string) => {
  return await Prescription.find({ patientId, clinicId })
    .populate('doctorId', 'name specialization')
    .populate('appointmentId', 'appointmentDate')
    .sort({ createdAt: -1 });
};

export const updatePrescription = async (clinicId: string, id: string, data: Partial<IPrescription>) => {
  return await Prescription.findOneAndUpdate(
    { _id: id, clinicId },
    { $set: data },
    { new: true, runValidators: true }
  );
};

export const deletePrescription = async (clinicId: string, id: string) => {
  return await Prescription.findOneAndDelete({ _id: id, clinicId });
};
