import Patient, { IPatient } from '../models/patient.model';
import MedicalHistory, { IMedicalHistory } from '../models/medicalHistory.model';
import Vitals, { IVitals } from '../models/vitals.model';
import Appointment from '../models/appointment.model';
import Prescription from '../models/prescription.model';

export const createPatient = async (clinicId: string, patientData: Partial<IPatient>) => {
  const patient = new Patient({ ...patientData, clinicId });
  return await patient.save();
};

export const getPatients = async (clinicId: string, filter: any = {}, skip = 0, limit = 10) => {
  const query = { clinicId, ...filter };
  const [data, total] = await Promise.all([
    Patient.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Patient.countDocuments(query),
  ]);
  return { data, total };
};

export const getPatientById = async (clinicId: string, id: string) => {
  return await Patient.findOne({ _id: id, clinicId });
};

export const updatePatient = async (clinicId: string, id: string, updateData: Partial<IPatient>) => {
  return await Patient.findOneAndUpdate(
    { _id: id, clinicId },
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

// Bug 5 Fix: Cascade delete — remove all related records when patient is deleted
export const deletePatient = async (clinicId: string, id: string) => {
  const patient = await Patient.findOneAndDelete({ _id: id, clinicId });
  if (patient) {
    // Delete all related data in parallel for performance
    await Promise.all([
      Appointment.deleteMany({ patientId: id, clinicId }),
      Prescription.deleteMany({ patientId: id, clinicId }),
      MedicalHistory.deleteMany({ patientId: id, clinicId }),
      Vitals.deleteMany({ patientId: id, clinicId }),
    ]);
  }
  return patient;
};

// Medical History
export const addMedicalHistory = async (clinicId: string, data: Partial<IMedicalHistory>) => {
  const history = new MedicalHistory({ ...data, clinicId });
  return await history.save();
};

export const getMedicalHistory = async (clinicId: string, patientId: string) => {
  return await MedicalHistory.find({ clinicId, patientId }).sort({ diagnosisDate: -1 });
};

export const deleteMedicalHistory = async (clinicId: string, historyId: string) => {
  return await MedicalHistory.findOneAndDelete({ _id: historyId, clinicId });
};

// Vitals
export const addVitals = async (clinicId: string, data: Partial<IVitals>) => {
  const vitals = new Vitals({ ...data, clinicId });
  return await vitals.save();
};

export const getVitals = async (clinicId: string, patientId: string) => {
  return await Vitals.find({ clinicId, patientId }).sort({ date: -1 });
};

export const deleteVitals = async (clinicId: string, vitalsId: string) => {
  return await Vitals.findOneAndDelete({ _id: vitalsId, clinicId });
};
