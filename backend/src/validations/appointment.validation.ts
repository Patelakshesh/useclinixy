import { z } from 'zod';

export const createAppointmentSchema = z.object({
  body: z.object({
    doctorId: z.string().length(24, 'Invalid doctor ID'),
    patientId: z.string().length(24, 'Invalid patient ID'),
    appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:mm'),
    notes: z.string().optional(),
    type: z.enum(['CONSULTATION', 'FOLLOW_UP', 'PROCEDURE']).optional(),
    duration: z.number().min(5).max(480).optional(),
  }),
});

export const updateAppointmentStatusSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']),
  }),
});
