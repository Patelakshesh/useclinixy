import { api } from '@/lib/axios';

export const loginUser = async (data: any) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data.data;
};

export const forgotPassword = async (email: string) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (data: any) => {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
};

export const changePassword = async (data: any) => {
  const response = await api.post('/auth/change-password', data);
  return response.data;
};
