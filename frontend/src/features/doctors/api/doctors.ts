import { api } from '@/lib/axios';

export const getDoctors = async (search = '', page = 1, limit = 10) => {
  const response = await api.get(`/doctors?search=${search}&page=${page}&limit=${limit}`);
  return response.data;
};

export const createDoctor = async (data: any) => {
  const response = await api.post('/doctors', data);
  return response.data;
};

export const deleteDoctor = async (id: string) => {
  const response = await api.delete(`/doctors/${id}`);
  return response.data;
};

export const updateDoctor = async (id: string, data: any) => {
  const response = await api.put(`/doctors/${id}`, data);
  return response.data;
};

// Leaves
export const getDoctorLeaves = async (doctorId: string) => {
  const response = await api.get(`/doctors/${doctorId}/leaves`);
  return response.data;
};

export const createDoctorLeave = async (doctorId: string, data: any) => {
  const response = await api.post(`/doctors/${doctorId}/leaves`, data);
  return response.data;
};

export const deleteDoctorLeave = async (doctorId: string, leaveId: string) => {
  const response = await api.delete(`/doctors/${doctorId}/leaves/${leaveId}`);
  return response.data;
};
