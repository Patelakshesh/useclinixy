import User from '../models/user.model';
import Clinic from '../models/clinic.model';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { signToken } from '../utils/jwt.util';
import { sendPasswordResetEmail } from './email.service';

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email })
    .select('+password')
    .populate('clinicId', 'subdomain name');
    
  if (!user || !user.password) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  if (user.status !== 'ACTIVE') {
    throw new Error('Your account is deactivated');
  }

  // Removed clinic suspension check here so they can login and pay. The middleware will block all non-billing routes.

  const token = signToken({
    userId: user._id.toString(),
    clinicId: user.clinicId ? (user.clinicId as any)._id.toString() : null,
    role: user.role,
    doctorId: (user as any).doctorId ? (user as any).doctorId.toString() : null,
  });

  user.lastLogin = new Date();
  await user.save();

  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, token };
};

export const forgotPassword = async (email: string, origin?: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found'); // Always throw to prevent email enumeration in real apps, but we handle it gracefully in controller
  }

  // Generate Reset Token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  await user.save();

  // Send real password reset email
  try {
    await sendPasswordResetEmail(user.email, (user as any).name || user.email, resetToken, origin);
  } catch (emailErr) {
    console.error('[Email] Failed to send password reset email:', emailErr);
    // Don't throw — the token was saved, admin can retrieve from logs in dev
    console.log(`[DEV FALLBACK] Reset Token for ${email}: ${resetToken}`);
  }
  
  return resetToken;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error('Invalid or expired password reset token');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
};

export const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await User.findById(userId).select('+password');
  if (!user || !user.password) {
    throw new Error('User not found');
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new Error('Incorrect current password');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
};
