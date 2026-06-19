import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  clinicId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  mobileNumber: string;
  specialization: string;
  qualification: string;
  experience: number;
  consultationFees: number;
  schedule: {
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    isWorkingDay: boolean;
    shifts: { startTime: string; endTime: string }[];
  }[];
  status: 'ACTIVE' | 'INACTIVE';
}

const doctorSchema: Schema = new Schema(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    mobileNumber: { type: String, required: true },
    specialization: { type: String, required: true },
    qualification: { type: String, required: true },
    experience: { type: Number, required: true },
    consultationFees: { type: Number, required: true },
    schedule: {
      type: [{
        day: { type: String, required: true },
        isWorkingDay: { type: Boolean, default: false },
        shifts: [{
          startTime: { type: String, required: true },
          endTime: { type: String, required: true }
        }]
      }],
      default: []
    },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

doctorSchema.index({ clinicId: 1, email: 1 }, { unique: true });

export default mongoose.model<IDoctor>('Doctor', doctorSchema);
