import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscriptionPlan extends Document {
  name: string;
  priceId: string; // Razorpay Plan ID or Stripe Price ID
  price: number;
  currency: string;
  interval: 'MONTHLY' | 'YEARLY';
  features: {
    maxDoctors: number;
    maxPatients: number;
    hasWhatsApp: boolean;
    hasOnlineBooking: boolean;
  };
  isActive: boolean;
}

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: { type: String, required: true },
    priceId: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    interval: { type: String, enum: ['MONTHLY', 'YEARLY'], default: 'MONTHLY' },
    features: {
      maxDoctors: { type: Number, default: 1 },
      maxPatients: { type: Number, default: 100 },
      hasWhatsApp: { type: Boolean, default: false },
      hasOnlineBooking: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISubscriptionPlan>('SubscriptionPlan', subscriptionPlanSchema);
