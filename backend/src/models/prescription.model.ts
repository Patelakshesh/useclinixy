import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicine {
  name: string;
  dosage: string; // e.g. "500mg"
  frequency: string; // e.g. "1-0-1" or "Twice a day"
  duration: string; // e.g. "5 days"
}

export interface IPrescription extends Document {
  clinicId: mongoose.Types.ObjectId;
  appointmentId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  medicines: IMedicine[];
  instructions?: string;
  notes?: string;
}

const medicineSchema = new Schema<IMedicine>({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
});

const prescriptionSchema: Schema = new Schema(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    medicines: { type: [medicineSchema], required: true },
    instructions: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

prescriptionSchema.index({ appointmentId: 1 }, { unique: true }); // One prescription per appointment
prescriptionSchema.index({ patientId: 1, createdAt: -1 });

export default mongoose.model<IPrescription>('Prescription', prescriptionSchema);
