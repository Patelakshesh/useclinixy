import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
});

export const getPatients = async (search = '', page = 1, limit = 10) => {
  const response = await api.get(`/patients?search=${search}&page=${page}&limit=${limit}`);
  return response.data;
};

export const createPatient = async (data: any) => {
  const response = await api.post('/patients', data);
  return response.data;
};

export const deletePatient = async (id: string) => {
  const response = await api.delete(`/patients/${id}`);
  return response.data;
};

export const updatePatient = async (id: string, data: any) => {
  const response = await api.put(`/patients/${id}`, data);
  return response.data;
};

export const getPatientById = async (id: string) => {
  const response = await api.get(`/patients/${id}`);
  return response.data;
};

// Medical History
export const addMedicalHistory = async (patientId: string, data: any) => {
  const response = await api.post(`/patients/${patientId}/history`, data);
  return response.data;
};
export const getMedicalHistory = async (patientId: string) => {
  const response = await api.get(`/patients/${patientId}/history`);
  return response.data;
};
export const deleteMedicalHistory = async (patientId: string, historyId: string) => {
  const response = await api.delete(`/patients/${patientId}/history/${historyId}`);
  return response.data;
};

// Vitals
export const addVitals = async (patientId: string, data: any) => {
  const response = await api.post(`/patients/${patientId}/vitals`, data);
  return response.data;
};
export const getVitals = async (patientId: string) => {
  const response = await api.get(`/patients/${patientId}/vitals`);
  return response.data;
};
export const deleteVitals = async (patientId: string, vitalsId: string) => {
  const response = await api.delete(`/patients/${patientId}/vitals/${vitalsId}`);
  return response.data;
};
