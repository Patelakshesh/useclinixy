import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
});

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
