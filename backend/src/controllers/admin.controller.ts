import { Request, Response, NextFunction } from 'express';
import Clinic from '../models/clinic.model';
import User from '../models/user.model';
import Subscription from '../models/subscription.model';
import SubscriptionPlan from '../models/subscriptionPlan.model';
import Doctor from '../models/doctor.model';
import Patient from '../models/patient.model';
import AuditLog from '../models/auditLog.model';
import Appointment from '../models/appointment.model';
import Prescription from '../models/prescription.model';
import MedicalHistory from '../models/medicalHistory.model';
import DoctorLeave from '../models/doctorLeave.model';
import Vitals from '../models/vitals.model';
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
    let filter: any = { status: { $ne: 'DELETED' } };
    if (status) filter.status = status;
    if (search) { filter.$or = [{ name: { $regex: search, $options: 'i' } }, { subdomain: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }]; }
    const clinics = await Clinic.find(filter).populate('ownerId', 'name email').populate({ path: 'subscriptionId', select: 'planId' }).sort({ createdAt: -1 });
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

export const deleteClinic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const clinic = await Clinic.findByIdAndDelete(id);
    if (!clinic) { res.status(404).json({ success: false, message: 'Clinic not found' }); return; }
    
    // Cascading delete for all associated data
    await User.deleteMany({ clinicId: id });
    await Doctor.deleteMany({ clinicId: id });
    await Patient.deleteMany({ clinicId: id });
    await Appointment.deleteMany({ clinicId: id });
    await Subscription.deleteMany({ clinicId: id });
    await Prescription.deleteMany({ clinicId: id });
    await MedicalHistory.deleteMany({ clinicId: id });
    await DoctorLeave.deleteMany({ clinicId: id });
    await Vitals.deleteMany({ clinicId: id });
    await AuditLog.deleteMany({ clinicId: id });
    
    logAudit((req as any).user.userId, 'CLINIC_PERMANENTLY_DELETED', { clinicId: id, name: clinic.name }, null, req.ip);
    res.status(200).json({ success: true, message: 'Clinic permanently deleted successfully' });
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

export const assignManualSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params; // clinicId
    const { planId, paymentMethod } = req.body;

    const clinic = await Clinic.findById(id);
    if (!clinic) {
      res.status(404).json({ success: false, message: 'Clinic not found' });
      return;
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      res.status(404).json({ success: false, message: 'Subscription Plan not found' });
      return;
    }

    // Check downgrade limits
    const currentDoctors = await Doctor.countDocuments({ clinicId: id });
    const currentPatients = await Patient.countDocuments({ clinicId: id });

    if (currentDoctors > plan.features.maxDoctors) {
      res.status(400).json({ 
        success: false, 
        message: `Cannot assign plan. Clinic has ${currentDoctors} doctors, but this plan only allows ${plan.features.maxDoctors}. They must delete ${currentDoctors - plan.features.maxDoctors} doctor(s) first.` 
      });
      return;
    }

    if (currentPatients > plan.features.maxPatients) {
      res.status(400).json({ 
        success: false, 
        message: `Cannot assign plan. Clinic has ${currentPatients} patients, but this plan only allows ${plan.features.maxPatients}. They must delete ${currentPatients - plan.features.maxPatients} patient(s) first.` 
      });
      return;
    }

    // Cancel existing active subscription
    await Subscription.updateMany({ clinicId: id, status: 'ACTIVE' }, { $set: { status: 'CANCELLED' } });

    // Create new manual subscription
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    const count = plan.intervalCount || 1;

    switch (plan.interval) {
      case 'MINUTES':
        currentPeriodEnd.setMinutes(currentPeriodEnd.getMinutes() + count);
        break;
      case 'HOURLY':
        currentPeriodEnd.setHours(currentPeriodEnd.getHours() + count);
        break;
      case 'DAILY':
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + count);
        break;
      case 'WEEKLY':
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + (7 * count));
        break;
      case 'MONTHLY':
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + count);
        break;
      case 'YEARLY':
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + count);
        break;
      case '3_YEARS':
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 3);
        break;
      case 'LIFETIME':
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 100);
        break;
      default:
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    const subscription = new Subscription({
      clinicId: id,
      planId,
      status: 'ACTIVE',
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: false
    });
    
    await subscription.save();

    // Update clinic status
    clinic.status = 'ACTIVE';
    clinic.subscriptionId = (subscription as any)._id;
    await clinic.save();

    logAudit((req as any).user.userId, 'MANUAL_SUBSCRIPTION_ASSIGNED', { clinicId: id, planId, paymentMethod }, null, req.ip);

    res.status(200).json({ success: true, message: 'Manual subscription assigned successfully', data: subscription });
  } catch (error) {
    next(error);
  }
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
    if (req.body.isDefault) {
      await SubscriptionPlan.updateMany({}, { $set: { isDefault: false } });
    }
    const plan = new SubscriptionPlan(req.body);
    await plan.save();
    logAudit((req as any).user.userId, 'PLAN_CREATED', { planId: (plan as any)._id, name: plan.name }, null, req.ip);
    res.status(201).json({ success: true, data: plan, message: 'Plan created successfully' });
  } catch (error) { next(error); }
};

export const updatePlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.body.isDefault) {
      await SubscriptionPlan.updateMany({ _id: { $ne: req.params.id } }, { $set: { isDefault: false } });
    }
    const plan = await SubscriptionPlan.findByIdAndUpdate((req.params.id as string), { $set: req.body }, { new: true, runValidators: true });
    if (!plan) { res.status(404).json({ success: false, message: 'Plan not found' }); return; }
    logAudit((req as any).user.userId, 'PLAN_UPDATED', { planId: (req.params.id as string), name: plan.name }, null, req.ip);
    res.status(200).json({ success: true, data: plan, message: 'Plan updated successfully' });
  } catch (error) { next(error); }
};

export const deletePlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const activeUsage = await Subscription.countDocuments({ planId: (req.params.id as string), status: 'ACTIVE' });
    if (activeUsage > 0) {
      res.status(400).json({ success: false, message: `Cannot delete: ${activeUsage} clinic(s) are currently on this plan.` });
      return;
    }
    const plan = await SubscriptionPlan.findByIdAndDelete((req.params.id as string));
    if (!plan) { res.status(404).json({ success: false, message: 'Plan not found' }); return; }
    logAudit((req as any).user.userId, 'PLAN_DELETED', { planId: (req.params.id as string), name: plan.name }, null, req.ip);
    res.status(200).json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) { next(error); }
};