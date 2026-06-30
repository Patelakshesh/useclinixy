import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscriptionPlan extends Document {
  name: string;
  priceId: string; // Razorpay Plan ID or Stripe Price ID
  price: number;
  currency: string;
  interval: 'MINUTES' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | '3_YEARS' | 'LIFETIME';
  intervalCount: number; // e.g., 14 for 14 Days
  discountPrice?: number;
  features: {
    maxDoctors: number;
    maxPatients: number;
    hasWhatsApp: boolean;
    hasOnlineBooking: boolean;
    hasGoogleMapsSetup: boolean;
  };
  isActive: boolean;
  isDefault: boolean;
}

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: { type: String, required: true },
    priceId: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    interval: { 
      type: String, 
      enum: ['MINUTES', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', '3_YEARS', 'LIFETIME'], 
      default: 'MONTHLY' 
    },
    intervalCount: { type: Number, default: 1 },
    features: {
      maxDoctors: { type: Number, default: 1 },
      maxPatients: { type: Number, default: 100 },
      hasWhatsApp: { type: Boolean, default: false },
      hasOnlineBooking: { type: Boolean, default: false },
      hasGoogleMapsSetup: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<ISubscriptionPlan>('SubscriptionPlan', subscriptionPlanSchema);
