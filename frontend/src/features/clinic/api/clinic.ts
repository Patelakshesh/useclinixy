import { api } from '@/lib/axios';

export const getClinicProfile = async () => {
  const response = await api.get('/clinic/profile');
  return response.data;
};

export const updateClinicProfile = async (data: any) => {
  const response = await api.put('/clinic/profile', data);
  return response.data;
};
