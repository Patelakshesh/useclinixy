import { api } from '@/lib/axios';

export const getStaff = async () => {
  const response = await api.get('/staff');
  return response.data.data;
};

export const createStaff = async (data: any) => {
  const response = await api.post('/staff', data);
  return response.data;
};

export const updateStaff = async (id: string, data: any) => {
  const response = await api.put(`/staff/${id}`, data);
  return response.data;
};

export const deleteStaff = async (id: string) => {
  const response = await api.delete(`/staff/${id}`);
  return response.data;
};
