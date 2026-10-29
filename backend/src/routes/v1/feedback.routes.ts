import { Router } from 'express';
import { submitFeedback } from '../../controllers/feedback.controller';
import { requireAuth } from '../../middlewares/auth.middleware';

const router = Router();

// Logged-in clinic users (doctors, clinic admins, staff) can submit feedback
router.post('/', requireAuth, submitFeedback);

export default router;
