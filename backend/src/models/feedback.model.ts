import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  clinicId?: mongoose.Types.ObjectId;
  clinicName?: string;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  userRole: string;
  rating: number; // 1 to 5
  category: 'FEATURE_REQUEST' | 'IMPROVEMENT' | 'BUG' | 'GENERAL';
  message: string;
  status: 'NEW' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema: Schema = new Schema(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', default: null },
    clinicName: { type: String, default: '' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    userRole: { type: String, default: 'CLINIC_ADMIN' },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    category: { 
      type: String, 
      enum: ['FEATURE_REQUEST', 'IMPROVEMENT', 'BUG', 'GENERAL'], 
      default: 'IMPROVEMENT' 
    },
    message: { type: String, required: true, trim: true },
    status: { 
      type: String, 
      enum: ['NEW', 'IN_REVIEW', 'RESOLVED', 'CLOSED'], 
      default: 'NEW' 
    },
    adminNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

feedbackSchema.index({ clinicId: 1, createdAt: -1 });
feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ category: 1, createdAt: -1 });

export default mongoose.model<IFeedback>('Feedback', feedbackSchema);
