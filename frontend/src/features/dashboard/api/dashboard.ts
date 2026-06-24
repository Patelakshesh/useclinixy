import { api } from '@/lib/axios';

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data.data;
};

export const getRecentActivities = async () => {
  const response = await api.get('/dashboard/activities');
  return response.data.data;
};

export const getReports = async () => {
  const response = await api.get('/dashboard/reports');
  return response.data.data;
};
