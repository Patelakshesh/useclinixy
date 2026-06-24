import { api } from '@/lib/axios';

export const createPrescription = async (data: any) => {
  const response = await api.post('/prescriptions', data);
  return response.data;
};

export const getPrescriptionByAppointment = async (appointmentId: string) => {
  const response = await api.get(`/prescriptions/appointment/${appointmentId}`);
  return response.data;
};

export const updatePrescription = async (id: string, data: any) => {
  const response = await api.put(`/prescriptions/${id}`, data);
  return response.data;
};

export const deletePrescription = async (id: string) => {
  const response = await api.delete(`/prescriptions/${id}`);
  return response.data;
};
