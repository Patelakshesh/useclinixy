import { Request, Response, NextFunction } from 'express';
import * as patientService from '../services/patient.service';
import { logAudit } from '../utils/auditLog.util';

export const createPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const patient = await patientService.createPatient(clinicId, req.body);
    logAudit(req.user?.userId!, 'PATIENT_CREATED', { patientId: (patient as any)._id, name: (patient as any).name }, clinicId, req.ip);
    res.status(201).json({ success: true, data: patient, message: 'Patient created successfully' });
  } catch (error) {
    next(error);
  }
};

export const getPatients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const page = parseInt((req.query.page as string) as string) || 1;
    const limit = parseInt((req.query.limit as string) as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if ((req.query.search as string)) {
      filter.$or = [
        { name: { $regex: (req.query.search as string), $options: 'i' } },
        { mobileNumber: { $regex: (req.query.search as string), $options: 'i' } },
      ];
    }

    const { data, total } = await patientService.getPatients(clinicId, filter, skip, limit);
    res.status(200).json({
      success: true,
      data,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const patient = await patientService.getPatientById(clinicId, (req.params.id as string));
    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient not found' });
      return;
    }
    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

export const updatePatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const patient = await patientService.updatePatient(clinicId, (req.params.id as string), req.body);
    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient not found' });
      return;
    }
    logAudit(req.user?.userId!, 'PATIENT_UPDATED', { patientId: (patient as any)._id, name: (patient as any).name }, clinicId, req.ip);
    res.status(200).json({ success: true, data: patient, message: 'Patient updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deletePatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const patient = await patientService.deletePatient(clinicId, (req.params.id as string));
    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient not found' });
      return;
    }
    logAudit(req.user?.userId!, 'PATIENT_DELETED', { patientId: (req.params.id as string) }, clinicId, req.ip);
    res.status(200).json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Medical History
export const addMedicalHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const history = await patientService.addMedicalHistory(clinicId, { ...req.body, patientId: (req.params.id as string) });
    res.status(201).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

export const getMedicalHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const history = await patientService.getMedicalHistory(clinicId, (req.params.id as string));
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

export const deleteMedicalHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    await patientService.deleteMedicalHistory(clinicId, (req.params.historyId as string));
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Vitals
export const addVitals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const vitals = await patientService.addVitals(clinicId, { ...req.body, patientId: (req.params.id as string) });
    res.status(201).json({ success: true, data: vitals });
  } catch (error) {
    next(error);
  }
};

export const getVitals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const vitals = await patientService.getVitals(clinicId, (req.params.id as string));
    res.status(200).json({ success: true, data: vitals });
  } catch (error) {
    next(error);
  }
};

export const deleteVitals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    await patientService.deleteVitals(clinicId, (req.params.vitalsId as string));
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
};
