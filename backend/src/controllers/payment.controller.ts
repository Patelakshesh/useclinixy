import { Request, Response, NextFunction } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import SubscriptionPlan from '../models/subscriptionPlan.model';
import Subscription from '../models/subscription.model';
import Clinic from '../models/clinic.model';



export const createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId.includes('dummy') || keySecret.includes('dummy')) {
      res.status(503).json({ success: false, message: 'Payment gateway is not configured. Please contact support.' });
      return;
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const { planId } = req.body;
    const clinicId = (req as any).user.clinicId;

    if (!clinicId) {
      res.status(403).json({ success: false, message: 'Only clinics can purchase plans' });
      return;
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan not found' });
      return;
    }

    const clinic = await Clinic.findById(clinicId);
    const subscription = await Subscription.findOne({ clinicId });
    if (clinic && clinic.status === 'SUSPENDED' && subscription && subscription.status === 'ACTIVE') {
      res.status(403).json({ success: false, message: 'Your clinic has been suspended by the administrator. Please contact support.' });
      return;
    }

    // Razorpay expects amount in paise (multiply by 100)
    const amountInPaise = plan.price * 100;

    const shortClinicId = clinicId.toString().substring(18); // Last 6 chars of ObjectId
    const orderOptions = {
      amount: amountInPaise,
      currency: plan.currency,
      receipt: `rcpt_${shortClinicId}_${Date.now()}`,
      notes: {
        clinicId: clinicId.toString(),
        planId: planId.toString(),
      }
    };

    const order = await razorpay.orders.create(orderOptions);

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error: any) {
    console.error('Razorpay Order Error:', error);
    // Razorpay often sends errors inside `error.error.description`
    const message = error?.error?.description || error.message || 'Failed to create payment order';
    res.status(500).json({ success: false, message });
  }
};

export const verifyPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;
    const clinicId = (req as any).user.clinicId;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_dummy_secret';

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
      return;
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan not found' });
      return;
    }

    // Payment is valid! Upgrade the clinic subscription.
    const now = new Date();
    let periodEnd = new Date();
    if (plan.interval === 'DAYS' || plan.interval === 'DAILY') {
      periodEnd.setDate(now.getDate() + plan.intervalCount);
    } else if (plan.interval === 'MONTHLY') {
      periodEnd.setMonth(now.getMonth() + plan.intervalCount);
    } else if (plan.interval === 'YEARLY') {
      periodEnd.setFullYear(now.getFullYear() + plan.intervalCount);
    } else if (plan.interval === 'MINUTES') {
      periodEnd.setMinutes(now.getMinutes() + plan.intervalCount);
    } else {
      // Default fallback
      periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    let subscription = await Subscription.findOne({ clinicId });

    if (!subscription) {
      subscription = new Subscription({
        clinicId,
        planId,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      });
    } else {
      subscription.planId = planId;
      subscription.status = 'ACTIVE';
      subscription.currentPeriodStart = now;
      subscription.currentPeriodEnd = periodEnd;
    }

    await subscription.save();

    // Ensure clinic status is ACTIVE (if it was trial or suspended, though suspended shouldn't be here)
    await Clinic.findByIdAndUpdate(clinicId, { status: 'ACTIVE', subscriptionId: subscription._id });

    res.status(200).json({
      success: true,
      message: 'Payment verified and subscription activated successfully',
    });
  } catch (error) {
    console.error('Razorpay Verification Error:', error);
    next(error);
  }
};
