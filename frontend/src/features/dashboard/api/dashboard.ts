import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
});

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
