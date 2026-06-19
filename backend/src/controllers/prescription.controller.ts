import { Request, Response, NextFunction } from 'express';
import * as prescriptionService from '../services/prescription.service';

export const createPrescription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const prescription = await prescriptionService.createPrescription(clinicId, req.body);
    res.status(201).json({ success: true, data: prescription, message: 'Prescription created successfully' });
  } catch (error: any) {
    if (error.message === 'A prescription already exists for this appointment') {
      res.status(409).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const getPrescriptionByAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const prescription = await prescriptionService.getPrescriptionByAppointment(clinicId, req.params.appointmentId);
    if (!prescription) {
      res.status(404).json({ success: false, message: 'Prescription not found' });
      return;
    }
    res.status(200).json({ success: true, data: prescription });
  } catch (error) {
    next(error);
  }
};

export const getPatientPrescriptions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const prescriptions = await prescriptionService.getPatientPrescriptions(clinicId, req.params.patientId);
    res.status(200).json({ success: true, data: prescriptions });
  } catch (error) {
    next(error);
  }
};

export const updatePrescription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const prescription = await prescriptionService.updatePrescription(clinicId, req.params.id, req.body);
    if (!prescription) {
      res.status(404).json({ success: false, message: 'Prescription not found' });
      return;
    }
    res.status(200).json({ success: true, data: prescription, message: 'Prescription updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deletePrescription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const prescription = await prescriptionService.deletePrescription(clinicId, req.params.id);
    if (!prescription) {
      res.status(404).json({ success: false, message: 'Prescription not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Prescription deleted successfully' });
  } catch (error) {
    next(error);
  }
};
