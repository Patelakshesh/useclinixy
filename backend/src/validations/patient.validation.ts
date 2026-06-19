import { z } from 'zod';

export const createPatientSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    mobileNumber: z.string().min(10, 'Mobile number must be at least 10 digits'),
    age: z.number().min(0, 'Age must be positive'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    address: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updatePatientSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: createPatientSchema.shape.body.partial(),
});
