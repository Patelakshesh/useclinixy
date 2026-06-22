import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clinicId: mongoose.Types.ObjectId | null;
  doctorId: mongoose.Types.ObjectId | null; // Null if not a DOCTOR
  name: string;
  email: string;
  password?: string;
  role: 'SUPER_ADMIN' | 'CLINIC_ADMIN' | 'DOCTOR' | 'RECEPTIONIST';
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const userSchema: Schema = new Schema(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', default: null },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', default: null },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'DOCTOR', 'RECEPTIONIST'], required: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    lastLogin: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

userSchema.index({ clinicId: 1, role: 1 });

export default mongoose.model<IUser>('User', userSchema);
