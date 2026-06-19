import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  clinicId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: string;
  details: any;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema: Schema = new Schema(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', default: null },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    details: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

auditLogSchema.index({ clinicId: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
