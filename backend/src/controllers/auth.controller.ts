import { Request, Response, NextFunction } from 'express';
import { loginUser, forgotPassword as forgotPasswordService, resetPassword as resetPasswordService, changePassword as changePasswordService } from '../services/auth.service';
import User from '../models/user.model';
import { logAudit } from '../utils/auditLog.util';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUser(email, password);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Audit: log successful login
    logAudit(user._id, 'USER_LOGIN', { email: user.email, role: user.role }, (user as any).clinicId, req.ip);

    res.status(200).json({
      success: true,
      data: { user, token },
      message: 'Login successful',
    });
  } catch (error: any) {
    if (error.message === 'Invalid email or password' || error.message === 'Your account is deactivated' || error.message === 'Your clinic account has been suspended by the administrator.') {
      res.status(401).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    await forgotPasswordService(email);
    // SECURITY FIX: Token is never returned in API response. It is sent via email only.
    res.status(200).json({ success: true, message: 'If this email is registered, a password reset link has been sent.' });
  } catch (error: any) {
    if (error.message === 'User not found') {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    await resetPasswordService(token, newPassword);
    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error: any) {
    if (error.message === 'Invalid or expired password reset token') {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user.userId;
    await changePasswordService(userId, currentPassword, newPassword);
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error: any) {
    if (error.message === 'Incorrect current password') {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
