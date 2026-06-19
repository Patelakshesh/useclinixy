import Doctor, { IDoctor } from '../models/doctor.model';
import DoctorLeave, { IDoctorLeave } from '../models/doctorLeave.model';
import mongoose from 'mongoose';

export const createDoctor = async (clinicId: string, doctorData: Partial<IDoctor>) => {
  const doctor = new Doctor({ ...doctorData, clinicId });
  return await doctor.save();
};

export const getDoctors = async (clinicId: string, filter: any = {}, skip = 0, limit = 10) => {
  const query = { clinicId, ...filter };
  const [data, total] = await Promise.all([
    Doctor.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Doctor.countDocuments(query),
  ]);
  return { data, total };
};

export const getDoctorById = async (clinicId: string, id: string) => {
  return await Doctor.findOne({ _id: id, clinicId });
};

export const updateDoctor = async (clinicId: string, id: string, updateData: Partial<IDoctor>) => {
  return await Doctor.findOneAndUpdate(
    { _id: id, clinicId },
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

export const deleteDoctor = async (clinicId: string, id: string) => {
  return await Doctor.findOneAndDelete({ _id: id, clinicId });
};

// Leaves
export const createDoctorLeave = async (clinicId: string, data: Partial<IDoctorLeave>) => {
  const leave = new DoctorLeave({ ...data, clinicId });
  return await leave.save();
};

export const getDoctorLeaves = async (clinicId: string, doctorId: string) => {
  return await DoctorLeave.find({ clinicId, doctorId }).sort({ startDate: 1 });
};

export const deleteDoctorLeave = async (clinicId: string, leaveId: string) => {
  return await DoctorLeave.findOneAndDelete({ _id: leaveId, clinicId });
};
