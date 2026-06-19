import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboard.service';
import Appointment from '../models/appointment.model';
import Patient from '../models/patient.model';
import Doctor from '../models/doctor.model';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const stats = await dashboardService.getDashboardStats(clinicId);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getRecentActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;
    const activities = await dashboardService.getRecentActivities(clinicId);
    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = req.user?.clinicId as string;

    // Last 6 months appointment trend
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const appointmentTrend = await Appointment.aggregate([
      { $match: { clinicId: new (require('mongoose').Types.ObjectId)(clinicId), createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] } },
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Top 5 doctors by appointment count
    const topDoctors = await Appointment.aggregate([
      { $match: { clinicId: new (require('mongoose').Types.ObjectId)(clinicId) } },
      { $group: { _id: '$doctorId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'doctors', localField: '_id', foreignField: '_id', as: 'doctor' } },
      { $unwind: '$doctor' },
      { $project: { _id: 0, name: '$doctor.name', specialization: '$doctor.specialization', count: 1 } },
    ]);

    // Appointment status breakdown (all time)
    const statusBreakdown = await Appointment.aggregate([
      { $match: { clinicId: new (require('mongoose').Types.ObjectId)(clinicId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // New patients per month (last 6 months)
    const patientGrowth = await Patient.aggregate([
      { $match: { clinicId: new (require('mongoose').Types.ObjectId)(clinicId), createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        newPatients: { $sum: 1 },
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: { appointmentTrend, topDoctors, statusBreakdown, patientGrowth },
    });
  } catch (error) {
    next(error);
  }
};

