import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
});

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
