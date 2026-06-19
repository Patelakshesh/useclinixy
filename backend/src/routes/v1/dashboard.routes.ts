import { Router } from 'express';
import * as dashboardController from '../../controllers/dashboard.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { checkSubscriptionActive } from '../../middlewares/subscription.middleware';

const router = Router();

router.use(requireAuth, checkSubscriptionActive);
router.get('/stats', dashboardController.getDashboardStats);
router.get('/activities', dashboardController.getRecentActivities);
router.get('/reports', dashboardController.getReports);

export default router;

