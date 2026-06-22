import { Request, Response, NextFunction } from 'express';
import SubscriptionPlan from '../models/subscriptionPlan.model';
import Subscription from '../models/subscription.model';
import Clinic from '../models/clinic.model';

export const getPlans = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
};

export const getCurrentSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = (req as any).user.clinicId;
    
    let subscription = await Subscription.findOne({ clinicId })
      .populate('planId');

    // If no explicit subscription exists, the clinic is on TRIAL and we map it to Starter implicitly
    if (!subscription) {
      const starterPlan = await SubscriptionPlan.findOne({ name: 'Starter' });
      
      const clinic = await Clinic.findById(clinicId);
      const isTrial = clinic?.status === 'TRIAL';
      
      res.status(200).json({ 
        success: true, 
        data: {
          status: isTrial ? 'TRIAL' : 'NO_PLAN',
          plan: starterPlan,
          currentPeriodStart: (clinic as any)?.createdAt,
          currentPeriodEnd: new Date((clinic as any)!.createdAt!.getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days trial
        } 
      });
      return;
    }

    // Map planId to plan for consistency with frontend expectations
    const responseData = {
      ...subscription.toObject(),
      plan: subscription.planId
    };

    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    next(error);
  }
};
