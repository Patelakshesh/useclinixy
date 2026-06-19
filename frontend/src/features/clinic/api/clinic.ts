import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
});

export const getClinicProfile = async () => {
  const response = await api.get('/clinic/profile');
  return response.data;
};

export const updateClinicProfile = async (data: any) => {
  const response = await api.put('/clinic/profile', data);
  return response.data;
};
