const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Setup axios instance with credentials (cookies) or auth header
import { adminApi } from '@/lib/axios';

export const getDashboardMetrics = async () => {
  const response = await adminApi.get('/dashboard');
  return response.data.data;
};

export const getAllClinics = async () => {
  const response = await adminApi.get('/clinics');
  return response.data.data;
};

export const updateClinicStatus = async (id: string, status: string) => {
  const response = await adminApi.patch(`/clinics/${id}/status`, { status });
  return response.data;
};

export const getAllSubscriptions = async () => {
  const response = await adminApi.get('/subscriptions');
  return response.data.data;
};

export const getAuditLogs = async () => {
  const response = await adminApi.get('/audit-logs');
  return response.data.data;
};

export const getAdminPlans = async () => {
  const response = await adminApi.get('/plans');
  return response.data.data;
};

export const createAdminPlan = async (data: any) => {
  const response = await adminApi.post('/plans', data);
  return response.data;
};

export const updateAdminPlan = async (id: string, data: any) => {
  const response = await adminApi.put(`/plans/${id}`, data);
  return response.data;
};

export const deleteAdminPlan = async (id: string) => {
  const response = await adminApi.delete(`/plans/${id}`);
  return response.data;
};
