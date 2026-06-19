import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicalHistory extends Document {
  patientId: mongoose.Types.ObjectId;
  clinicId: mongoose.Types.ObjectId;
  condition: string;
  diagnosisDate: string;
  notes?: string;
}

const medicalHistorySchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
    condition: { type: String, required: true },
    diagnosisDate: { type: String, required: true }, // YYYY-MM-DD
    notes: { type: String },
  },
  { timestamps: true }
);

medicalHistorySchema.index({ patientId: 1, diagnosisDate: -1 });

export default mongoose.model<IMedicalHistory>('MedicalHistory', medicalHistorySchema);
