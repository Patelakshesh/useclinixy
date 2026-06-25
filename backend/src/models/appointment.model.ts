import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  clinicId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  type: 'CONSULTATION' | 'FOLLOW_UP' | 'PROCEDURE' | 'EMERGENCY';
  duration: number; // in minutes
  paymentMode: 'CASH' | 'ONLINE' | 'PENDING';
  feesApplied: number;
  isEmergency: boolean;
  notes?: string;
}

const appointmentSchema: Schema = new Schema(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    appointmentDate: { type: String, required: true },
    appointmentTime: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
    type: {
      type: String,
      enum: ['CONSULTATION', 'FOLLOW_UP', 'PROCEDURE', 'EMERGENCY'],
      default: 'CONSULTATION',
    },
    duration: { type: Number, default: 15 },
    paymentMode: {
      type: String,
      enum: ['CASH', 'ONLINE', 'PENDING'],
      default: 'PENDING',
    },
    feesApplied: { type: Number, default: 0 },
    isEmergency: { type: Boolean, default: false },
    notes: { type: String },
  },
  { timestamps: true }
);

// Prevent double booking (handled in service layer to allow cancelled appointments)
appointmentSchema.index({ doctorId: 1, appointmentDate: 1, appointmentTime: 1 });
// Fast query for dashboard
appointmentSchema.index({ clinicId: 1, appointmentDate: 1 });

export default mongoose.model<IAppointment>('Appointment', appointmentSchema);
