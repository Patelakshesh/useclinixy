import { Router } from 'express';
import { getClinicProfile, updateClinicProfile, registerClinic, checkSubdomain } from '../../controllers/clinic.controller';
import { requireAuth, requireClinicAdmin } from '../../middlewares/auth.middleware';
import rateLimit from 'express-rate-limit';

const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 clinic registrations per hour
  message: { success: false, message: 'Too many clinics registered from this IP. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.get('/check-subdomain/:subdomain', checkSubdomain);
router.post('/register', registrationLimiter, registerClinic);

router.use(requireAuth);
router.get('/profile', getClinicProfile);
router.put('/profile', requireClinicAdmin, updateClinicProfile);

export default router;
