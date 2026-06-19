import mongoose, { Schema, Document } from 'mongoose';

export interface IClinic extends Document {
  name: string;
  subdomain: string;
  logo?: string;
  address: string;
  email: string;
  mobileNumber: string;
  workingHours: {
    start: string;
    end: string;
    days: string[];
  };
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TRIAL';
  subscriptionId?: mongoose.Types.ObjectId;
  ownerId?: mongoose.Types.ObjectId;
}

const clinicSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    subdomain: { type: String, unique: true, lowercase: true, trim: true },
    logo: { type: String },
    address: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    mobileNumber: { type: String, required: true },
    workingHours: {
      start: { type: String, required: true },
      end: { type: String, required: true },
      days: [{ type: String }],
    },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TRIAL'], default: 'TRIAL' },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model<IClinic>('Clinic', clinicSchema);
