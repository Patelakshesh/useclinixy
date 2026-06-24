import { api } from '@/lib/axios';

export const getSubscriptionPlans = async () => {
  const response = await api.get('/subscriptions/plans');
  return response.data.data;
};

export const getCurrentSubscription = async () => {
  const response = await api.get('/subscriptions/current');
  return response.data.data;
};

export const createPaymentOrder = async (planId: string) => {
  const response = await api.post('/payments/create-order', { planId });
  return response.data.data;
};

export const verifyPaymentOrder = async (paymentData: any) => {
  const response = await api.post('/payments/verify', paymentData);
  return response.data;
};
