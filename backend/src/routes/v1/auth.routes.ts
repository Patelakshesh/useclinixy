import { Router } from 'express';
import { login, logout, forgotPassword, resetPassword, changePassword, getMe } from '../../controllers/auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { loginSchema } from '../../validations/auth.validation';
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, message: 'Too many password reset requests. Please try again in 1 hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', requireAuth, changePassword);
router.get('/me', requireAuth, getMe);

export default router;
