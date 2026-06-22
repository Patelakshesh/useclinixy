import { Router } from 'express';
import { getStaff, createStaff, deleteStaff, updateStaff } from '../../controllers/staff.controller';
import { requireAuth, requireClinicAdmin } from '../../middlewares/auth.middleware';
import { checkSubscriptionActive } from '../../middlewares/subscription.middleware';

const router = Router();

// Only clinic admins can manage staff
router.use(requireAuth, requireClinicAdmin, checkSubscriptionActive);

router.get('/', getStaff);
router.post('/', createStaff);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);

export default router;
