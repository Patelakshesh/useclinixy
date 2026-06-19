import mongoose, { Schema, Document } from 'mongoose';

export interface IVitals extends Document {
  patientId: mongoose.Types.ObjectId;
  clinicId: mongoose.Types.ObjectId;
  date: string;
  bloodPressure?: string; // e.g. "120/80"
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
}

const vitalsSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    bloodPressure: { type: String },
    heartRate: { type: Number },
    temperature: { type: Number },
    weight: { type: Number },
    height: { type: Number },
  },
  { timestamps: true }
);

vitalsSchema.index({ patientId: 1, date: -1 });

export default mongoose.model<IVitals>('Vitals', vitalsSchema);
