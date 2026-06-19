import { Request, Response, NextFunction } from 'express';
import Clinic from '../models/clinic.model';
import SubscriptionPlan from '../models/subscriptionPlan.model';
import Subscription from '../models/subscription.model';
import Doctor from '../models/doctor.model';
import Patient from '../models/patient.model';

export const checkSubscriptionLimits = (feature: 'maxDoctors' | 'maxPatients') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clinicId = (req as any).user.clinicId;
      if (!clinicId) {
        res.status(403).json({ success: false, message: 'Access denied' });
        return;
      }

      const clinic = await Clinic.findById(clinicId);
      if (clinic?.status === 'SUSPENDED') {
        res.status(403).json({ success: false, message: 'Clinic is suspended' });
        return;
      }

      let currentLimit = 1; // Default for trial/starter
      let activePlan = null;

      const subscription = await Subscription.findOne({ clinicId }).populate('planId');
      
      if (subscription && subscription.status === 'ACTIVE') {
        activePlan = subscription.planId as any;
      } else {
        // Trial or no active subscription -> Starter plan limits
        activePlan = await SubscriptionPlan.findOne({ name: 'Starter' });
      }

      if (activePlan) {
        currentLimit = activePlan.features[feature];
      }

      // Check current usage
      let currentUsage = 0;
      if (feature === 'maxDoctors') {
        currentUsage = await Doctor.countDocuments({ clinicId });
      } else if (feature === 'maxPatients') {
        currentUsage = await Patient.countDocuments({ clinicId });
      }

      if (currentUsage >= currentLimit) {
        const featureName = feature.replace('max', '').toLowerCase();
        const itemName = currentLimit === 1 ? featureName.slice(0, -1) : featureName;
        
        res.status(403).json({ 
          success: false, 
          message: `Upgrade required. You have reached the limit of ${currentLimit} ${itemName} for your current plan.`,
          code: 'SUBSCRIPTION_LIMIT_REACHED'
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Bug 3 Fix: Enforce subscription expiry on every protected clinic route
export const checkSubscriptionActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = (req as any).user?.clinicId;
    // Super admins bypass this check
    if (!clinicId) return next();

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      res.status(404).json({ success: false, message: 'Clinic not found' });
      return;
    }

    if (clinic.status === 'SUSPENDED') {
      res.status(403).json({ success: false, message: 'Your clinic account has been suspended. Please contact support.', code: 'CLINIC_SUSPENDED' });
      return;
    }

    // Check if a paid subscription exists and has expired
    const subscription = await Subscription.findOne({ clinicId });
    if (subscription && subscription.status === 'ACTIVE') {
      const now = new Date();
      if (subscription.currentPeriodEnd < now) {
        // Auto-expire: mark it
        subscription.status = 'EXPIRED' as any;
        await subscription.save();
        await Clinic.findByIdAndUpdate(clinicId, { status: 'SUSPENDED' });
        res.status(402).json({ 
          success: false, 
          message: 'Your subscription has expired. Please renew to continue.',
          code: 'SUBSCRIPTION_EXPIRED'
        });
        return;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
