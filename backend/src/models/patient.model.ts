import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  clinicId: mongoose.Types.ObjectId;
  name: string;
  mobileNumber: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  notes?: string;
}

const patientSchema: Schema = new Schema(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
    name: { type: String, required: true, trim: true },
    mobileNumber: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], required: true },
    address: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

patientSchema.index({ clinicId: 1, mobileNumber: 1 }, { unique: true });

export default mongoose.model<IPatient>('Patient', patientSchema);
