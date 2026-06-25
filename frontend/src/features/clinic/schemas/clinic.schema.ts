import { z } from 'zod';

export const clinicProfileSchema = z.object({
  name: z.string().min(2, 'Clinic name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobileNumber: z.string().regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  workingHours: z.object({
    start: z.string().min(1, 'Start time is required'),
    end: z.string().min(1, 'End time is required'),
    days: z.array(z.string()).min(1, 'Select at least one working day')
  }),
  logo: z.string().optional()
});

export type ClinicProfileFormData = z.infer<typeof clinicProfileSchema>;
