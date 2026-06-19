import { Router } from 'express';
import { getClinicProfile, updateClinicProfile, registerClinic } from '../../controllers/clinic.controller';
import { requireAuth, requireClinicAdmin } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/register', registerClinic);

router.use(requireAuth);
router.get('/profile', getClinicProfile);
router.put('/profile', requireClinicAdmin, updateClinicProfile);

export default router;
