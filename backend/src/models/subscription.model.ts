import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  clinicId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'EXPIRED';
  razorpaySubscriptionId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true, unique: true },
    planId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    status: { type: String, enum: ['ACTIVE', 'CANCELLED', 'PAST_DUE', 'EXPIRED'], default: 'ACTIVE' },
    razorpaySubscriptionId: { type: String },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema);
