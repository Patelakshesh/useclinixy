import { Request, Response, NextFunction } from 'express';
import * as doctorService from '../services/doctor.service';
import { logAudit } from '../utils/auditLog.util';

export const createDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const doctor = await doctorService.createDoctor(clinicId, req.body);
    logAudit(req.user?.userId!, 'DOCTOR_CREATED', { doctorId: (doctor as any)._id, name: (doctor as any).name }, clinicId, req.ip);
    res.status(201).json({ success: true, data: doctor, message: 'Doctor created successfully' });
  } catch (error) {
    next(error);
  }
};

export const getDoctors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { specialization: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const { data, total } = await doctorService.getDoctors(clinicId, filter, skip, limit);
    res.status(200).json({
      success: true,
      data,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const doctor = await doctorService.getDoctorById(clinicId, req.params.id);
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

export const updateDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const doctor = await doctorService.updateDoctor(clinicId, req.params.id, req.body);
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }
    res.status(200).json({ success: true, data: doctor, message: 'Doctor updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const doctor = await doctorService.deleteDoctor(clinicId, req.params.id);
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }
    logAudit(req.user?.userId!, 'DOCTOR_DELETED', { doctorId: req.params.id }, clinicId, req.ip);
    res.status(200).json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Leaves
export const createDoctorLeave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const leave = await doctorService.createDoctorLeave(clinicId, { ...req.body, doctorId: req.params.id });
    res.status(201).json({ success: true, data: leave, message: 'Leave added successfully' });
  } catch (error) {
    next(error);
  }
};

export const getDoctorLeaves = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const leaves = await doctorService.getDoctorLeaves(clinicId, req.params.id);
    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    next(error);
  }
};

export const deleteDoctorLeave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const leave = await doctorService.deleteDoctorLeave(clinicId, req.params.leaveId);
    if (!leave) {
      res.status(404).json({ success: false, message: 'Leave not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Leave deleted successfully' });
  } catch (error) {
    next(error);
  }
};
