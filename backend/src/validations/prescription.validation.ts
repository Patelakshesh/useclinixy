import { z } from 'zod';

export const prescriptionSchema = z.object({
  body: z.object({
    appointmentId: z.string().length(24, 'Invalid appointment ID'),
    patientId: z.string().length(24, 'Invalid patient ID'),
    doctorId: z.string().length(24, 'Invalid doctor ID'),
    medicines: z.array(
      z.object({
        name: z.string().min(1, 'Medicine name is required'),
        dosage: z.string().min(1, 'Dosage is required'),
        frequency: z.string().min(1, 'Frequency is required'),
        duration: z.string().min(1, 'Duration is required'),
      })
    ).min(1, 'At least one medicine is required'),
    instructions: z.string().optional(),
    notes: z.string().optional(),
  }),
});
