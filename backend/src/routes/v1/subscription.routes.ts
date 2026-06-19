import { Router } from 'express';
import { getPlans, getCurrentSubscription } from '../../controllers/subscription.controller';
import { requireAuth } from '../../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/plans', getPlans);
router.get('/current', getCurrentSubscription);

export default router;
