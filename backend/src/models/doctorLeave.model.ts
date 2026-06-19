import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctorLeave extends Document {
  clinicId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  reason?: string;
  status: 'APPROVED' | 'CANCELLED';
}

const doctorLeaveSchema: Schema = new Schema(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    reason: { type: String },
    status: { type: String, enum: ['APPROVED', 'CANCELLED'], default: 'APPROVED' },
  },
  { timestamps: true }
);

doctorLeaveSchema.index({ doctorId: 1, startDate: 1, endDate: 1 });

export default mongoose.model<IDoctorLeave>('DoctorLeave', doctorLeaveSchema);
