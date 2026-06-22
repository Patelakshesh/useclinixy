import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Get all staff members (excluding super admins) for the clinic
export const getStaff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = (req as any).user.clinicId;
    const staff = await User.find({ clinicId, role: { $in: ['CLINIC_ADMIN', 'DOCTOR', 'RECEPTIONIST'] } })
      .select('-password')
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
};

// Create a new staff account
export const createStaff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = (req as any).user.clinicId;
    const { name, email, password, role, doctorId } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email already registered' });
      return;
    }

    if (!password || password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newStaff = new User({
      clinicId,
      name,
      email,
      password: passwordHash,
      role,
      doctorId: role === 'DOCTOR' ? doctorId : null,
      status: 'ACTIVE'
    });

    await newStaff.save();

    const staffObj = newStaff.toObject();
    delete staffObj.password;

    res.status(201).json({ 
      success: true, 
      data: staffObj, 
      message: 'Staff account created successfully.' 
    });
  } catch (error) {
    next(error);
  }
};

// Delete a staff member
export const deleteStaff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = (req as any).user.clinicId;
    const { id } = req.params;

    // Prevent clinic admin from deleting themselves
    if (id === (req as any).user.userId) {
      res.status(400).json({ success: false, message: 'You cannot delete your own account' });
      return;
    }

    const staff = await User.findOneAndDelete({ _id: id, clinicId });
    if (!staff) {
      res.status(404).json({ success: false, message: 'Staff member not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Staff member deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Update a staff member
export const updateStaff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clinicId = (req as any).user.clinicId;
    const { id } = req.params;
    const { name, role, status, doctorId } = req.body;

    // We don't allow email or password updates via this endpoint for security reasons
    // (Users should use Forgot Password / Settings to change those)

    const updateData: any = { name, role, status };
    if (role === 'DOCTOR') {
      updateData.doctorId = doctorId;
    } else {
      updateData.doctorId = null;
    }

    const staff = await User.findOneAndUpdate(
      { _id: id, clinicId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!staff) {
      res.status(404).json({ success: false, message: 'Staff member not found' });
      return;
    }

    res.status(200).json({ success: true, data: staff, message: 'Staff member updated successfully' });
  } catch (error) {
    next(error);
  }
};
