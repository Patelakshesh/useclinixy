import { Router } from 'express';
import { getClinicProfile, updateClinicProfile, registerClinic, checkSubdomain } from '../../controllers/clinic.controller';
import { requireAuth, requireClinicAdmin } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/check-subdomain/:subdomain', checkSubdomain);
router.post('/register', registerClinic);

router.use(requireAuth);
router.get('/profile', getClinicProfile);
router.put('/profile', requireClinicAdmin, updateClinicProfile);

export default router;
