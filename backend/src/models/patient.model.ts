import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  clinicId: mongoose.Types.ObjectId;
  name: string;
  mobileNumber: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  uhid?: string;
  height?: number;
  weight?: number;
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
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
    uhid: { type: String },
    height: { type: Number },
    weight: { type: Number },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    notes: { type: String },
  },
  { timestamps: true }
);

patientSchema.index({ clinicId: 1, mobileNumber: 1 }, { unique: true });
patientSchema.index({ clinicId: 1, uhid: 1 });

export default mongoose.model<IPatient>('Patient', patientSchema);
