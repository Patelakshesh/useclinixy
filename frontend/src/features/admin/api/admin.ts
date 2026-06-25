const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Setup axios instance with credentials (cookies) or auth header
import { adminApi } from '@/lib/axios';

export const getDashboardMetrics = async () => {
  const response = await adminApi.get('/admin/dashboard');
  return response.data.data;
};

export const getAllClinics = async () => {
  const response = await adminApi.get('/admin/clinics');
  return response.data.data;
};

export const updateClinicStatus = async (id: string, status: string) => {
  const response = await adminApi.patch(`/admin/clinics/${id}/status`, { status });
  return response.data;
};

export const deleteClinic = async (id: string) => {
  const response = await adminApi.delete(`/admin/clinics/${id}`);
  return response.data;
};

export const assignManualSubscription = async (id: string, data: { planId: string; paymentMethod: string }) => {
  const response = await adminApi.post(`/admin/clinics/${id}/subscription`, data);
  return response.data;
};

export const getAllSubscriptions = async () => {
  const response = await adminApi.get('/admin/subscriptions');
  return response.data.data;
};

export const getAuditLogs = async () => {
  const response = await adminApi.get('/admin/audit-logs');
  return response.data.data;
};

export const getAdminPlans = async () => {
  const response = await adminApi.get('/admin/plans');
  return response.data.data;
};

export const createAdminPlan = async (data: any) => {
  const response = await adminApi.post('/admin/plans', data);
  return response.data;
};

export const updateAdminPlan = async (id: string, data: any) => {
  const response = await adminApi.put(`/admin/plans/${id}`, data);
  return response.data;
};

export const deleteAdminPlan = async (id: string) => {
  const response = await adminApi.delete(`/admin/plans/${id}`);
  return response.data;
};
