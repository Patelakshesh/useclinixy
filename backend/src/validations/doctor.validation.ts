import { z } from 'zod';

export const createDoctorSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    mobileNumber: z.string().min(10, 'Mobile number must be at least 10 digits'),
    specialization: z.string().min(1, 'Specialization is required'),
    qualification: z.string().min(1, 'Qualification is required'),
    experience: z.number().min(0, 'Experience must be a positive number'),
    consultationFees: z.number().min(0, 'Fees cannot be negative'),
    schedule: z.array(z.object({
      day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
      isWorkingDay: z.boolean(),
      shifts: z.array(z.object({
        startTime: z.string(),
        endTime: z.string()
      }))
    })).optional(),
  }),
});

export const updateDoctorSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: createDoctorSchema.shape.body.partial(),
});
