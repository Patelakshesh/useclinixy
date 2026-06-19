import { Request, Response, NextFunction } from 'express';
import Clinic from '../models/clinic.model';
import User from '../models/user.model';
import Subscription from '../models/subscription.model';
import SubscriptionPlan from '../models/subscriptionPlan.model';
import AuditLog from '../models/auditLog.model';
import { logAudit } from '../utils/auditLog.util';

export const getAdminDashboardMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const totalClinics = await Clinic.countDocuments();
    const activeClinics = await Clinic.countDocuments({ status: 'ACTIVE' });
    const trialClinics = await Clinic.countDocuments({ status: 'TRIAL' });
    const suspendedClinics = await Clinic.countDocuments({ status: 'SUSPENDED' });
    const activeSubscriptions = await Subscription.find({ status: 'ACTIVE' }).populate('planId');
    let mrr = 0;
    activeSubscriptions.forEach((sub: any) => {
      if (sub.planId && sub.planId.price) {
        mrr += sub.planId.interval === 'YEARLY' ? sub.planId.price / 12 : sub.planId.price;
      }
    });
    const recentClinics = await Clinic.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('ownerId', 'name email')
      .populate({ path: 'subscriptionId', populate: { path: 'planId', select: 'name price interval' } });
    res.status(200).json({ success: true, data: { kpis: { totalClinics, activeClinics, trialClinics, suspendedClinics, mrr }, recentClinics } });
  } catch (error) { next(error); }
};

export const getAllClinics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, search } = req.query;
    let filter: any = {};
    if (status) filter.status = status;
    if (search) { filter.$or = [{ name: { $regex: search, $options: 'i' } }, { subdomain: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }]; }
    const clinics = await Clinic.find(filter).populate('ownerId', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: clinics });
  } catch (error) { next(error); }
};

export const updateClinicStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['ACTIVE', 'SUSPENDED', 'TRIAL', 'INACTIVE'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status provided' });
      return;
    }
    const clinic = await Clinic.findByIdAndUpdate(id, { status }, { new: true });
    if (!clinic) { res.status(404).json({ success: false, message: 'Clinic not found' }); return; }
    logAudit((req as any).user.userId, 'CLINIC_STATUS_CHANGED', { clinicId: id, newStatus: status }, null, req.ip);
    res.status(200).json({ success: true, message: `Clinic status updated to ${status}`, data: clinic });
  } catch (error) { next(error); }
};

export const getAllSubscriptions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const subscriptions = await Subscription.find()
      .populate('clinicId', 'name subdomain')
      .populate('planId', 'name price interval')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) { next(error); }
};

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const logs = await AuditLog.find()
      .populate('clinicId', 'name')
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json({ success: true, data: logs });
  } catch (error) { next(error); }
};

// 6. Plan Management (CRUD) for Super Admin
export const getPlansAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plans = await SubscriptionPlan.find().sort({ price: 1 });
    res.status(200).json({ success: true, data: plans });
  } catch (error) { next(error); }
};

export const createPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plan = new SubscriptionPlan(req.body);
    await plan.save();
    logAudit((req as any).user.userId, 'PLAN_CREATED', { planId: (plan as any)._id, name: plan.name }, null, req.ip);
    res.status(201).json({ success: true, data: plan, message: 'Plan created successfully' });
  } catch (error) { next(error); }
};

export const updatePlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!plan) { res.status(404).json({ success: false, message: 'Plan not found' }); return; }
    logAudit((req as any).user.userId, 'PLAN_UPDATED', { planId: req.params.id, name: plan.name }, null, req.ip);
    res.status(200).json({ success: true, data: plan, message: 'Plan updated successfully' });
  } catch (error) { next(error); }
};

export const deletePlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const activeUsage = await Subscription.countDocuments({ planId: req.params.id, status: 'ACTIVE' });
    if (activeUsage > 0) {
      res.status(400).json({ success: false, message: `Cannot delete: ${activeUsage} clinic(s) are currently on this plan.` });
      return;
    }
    const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id);
    if (!plan) { res.status(404).json({ success: false, message: 'Plan not found' }); return; }
    logAudit((req as any).user.userId, 'PLAN_DELETED', { planId: req.params.id, name: plan.name }, null, req.ip);
    res.status(200).json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) { next(error); }
};