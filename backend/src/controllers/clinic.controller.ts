import { Request, Response, NextFunction } from 'express';
import Clinic from '../models/clinic.model';
import User from '../models/user.model';
import SubscriptionPlan from '../models/subscriptionPlan.model';
import Subscription from '../models/subscription.model';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

export const checkSubdomain = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { subdomain } = req.params;
    if (!subdomain) {
      res.status(400).json({ success: false, message: 'Subdomain is required' });
      return;
    }
    const normalizedSubdomain = String(subdomain).toLowerCase().trim();
    const existingClinic = await Clinic.findOne({ subdomain: normalizedSubdomain });
    
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    if (existingClinic) {
      res.status(200).json({ success: true, available: false, message: 'Subdomain already taken' });
    } else {
      res.status(200).json({ success: true, available: true, message: 'Subdomain available' });
    }
  } catch (error) {
    next(error);
  }
};

export const getClinicProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = (req as any).user.clinicId;
    if (!clinicId) {
      res.status(404).json({ success: false, message: 'Clinic not found for this user' });
      return;
    }

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      res.status(404).json({ success: false, message: 'Clinic not found' });
      return;
    }

    res.status(200).json({ success: true, data: clinic });
  } catch (error) {
    next(error);
  }
};

export const updateClinicProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = (req as any).user.clinicId;
    if (!clinicId) {
      res.status(404).json({ success: false, message: 'Clinic not found for this user' });
      return;
    }

    const updatedClinic = await Clinic.findByIdAndUpdate(
      clinicId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedClinic) {
      res.status(404).json({ success: false, message: 'Clinic not found' });
      return;
    }

    res.status(200).json({ success: true, data: updatedClinic, message: 'Clinic profile updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const registerClinic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { clinicName, subdomain, address, phone, adminName, adminEmail, adminPassword } = req.body;

    const normalizedSubdomain = String(subdomain).toLowerCase().trim();

    // Check if subdomain is available
    const existingClinic = await Clinic.findOne({ subdomain: normalizedSubdomain }).session(session);
    if (existingClinic) {
      res.status(400).json({ success: false, message: 'Subdomain already in use' });
      await session.abortTransaction();
      session.endSession();
      return;
    }

    // Check if admin email is available
    const existingUser = await User.findOne({ email: adminEmail }).session(session);
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email already registered' });
      await session.abortTransaction();
      session.endSession();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    // Create Admin User
    const adminUser = new User({
      name: adminName,
      email: adminEmail,
      password: passwordHash,
      role: 'CLINIC_ADMIN',
      status: 'ACTIVE'
    });
    
    // Create Clinic
    const clinic = new Clinic({
      name: clinicName,
      subdomain: normalizedSubdomain,
      address,
      phone,
      email: adminEmail,
      mobileNumber: phone,
      ownerId: adminUser._id,
      workingHours: {
        start: '09:00',
        end: '18:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      },
      status: 'TRIAL'
    });

    // Link user to clinic
    adminUser.clinicId = clinic._id as any;

    await clinic.save({ session });
    await adminUser.save({ session });

    // Check for default registration plan
    const defaultPlan = await SubscriptionPlan.findOne({ isDefault: true }).session(session);
    let successMessage = 'Clinic registered successfully. Welcome to your trial!';

    if (defaultPlan) {
      const now = new Date();
      let endDate = new Date();

      if (defaultPlan.interval === 'DAILY') {
        endDate.setDate(now.getDate() + defaultPlan.intervalCount);
      } else if (defaultPlan.interval === 'MONTHLY') {
        endDate.setMonth(now.getMonth() + defaultPlan.intervalCount);
      } else if (defaultPlan.interval === 'YEARLY') {
        endDate.setFullYear(now.getFullYear() + defaultPlan.intervalCount);
      } else if (defaultPlan.interval === 'MINUTES') {
        endDate.setMinutes(now.getMinutes() + defaultPlan.intervalCount);
      }

      const subscription = new Subscription({
        clinicId: clinic._id,
        planId: defaultPlan._id,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: endDate,
        razorpaySubscriptionId: 'manual_default_plan',
      });
      await subscription.save({ session });
      successMessage = `Clinic registered successfully. You have been assigned the ${defaultPlan.name} plan!`;
      
      // Update clinic status to ACTIVE since they have a subscription
      clinic.status = 'ACTIVE';
      await clinic.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ 
      success: true, 
      message: successMessage,
      data: {
        clinicId: clinic._id,
        subdomain: clinic.subdomain
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};
