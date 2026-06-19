import { Router } from 'express';
import * as publicController from '../../controllers/public.controller';

const router = Router();

// No authentication required! These are consumer facing.
router.get('/:clinicId', publicController.getClinicDetails);
router.get('/:clinicId/doctors', publicController.getClinicDoctors);
router.post('/:clinicId/book', publicController.bookPublicAppointment);

export default router;
