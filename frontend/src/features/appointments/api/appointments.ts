import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
});

export const getAppointments = async (search = '', page = 1, limit = 10) => {
  const response = await api.get(`/appointments?search=${search}&page=${page}&limit=${limit}`);
  return response.data;
};

export const createAppointment = async (data: any) => {
  const response = await api.post('/appointments', data);
  return response.data;
};

export const updateAppointmentStatus = async (id: string, status: string) => {
  const response = await api.patch(`/appointments/${id}/status`, { status });
  return response.data;
};

export const updateAppointment = async (id: string, data: any) => {
  const response = await api.put(`/appointments/${id}`, data);
  return response.data;
};

export const getCalendarAppointments = async (startDate: string, endDate: string, doctorId?: string) => {
  const queryParams = new URLSearchParams({ startDate, endDate });
  if (doctorId) queryParams.append('doctorId', doctorId);
  const response = await api.get(`/appointments/calendar?${queryParams.toString()}`);
  return response.data;
};
