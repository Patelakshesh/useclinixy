import { api } from '@/lib/axios';

export interface SubmitFeedbackPayload {
  rating: number;
  category: 'FEATURE_REQUEST' | 'IMPROVEMENT' | 'BUG' | 'GENERAL';
  message: string;
}

export const submitClinicFeedback = async (payload: SubmitFeedbackPayload) => {
  const response = await api.post('/feedback', payload);
  return response.data;
};
