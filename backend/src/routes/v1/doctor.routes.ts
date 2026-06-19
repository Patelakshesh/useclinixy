import { Router } from 'express';
import * as doctorController from '../../controllers/doctor.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { checkSubscriptionLimits, checkSubscriptionActive } from '../../middlewares/subscription.middleware';
import { createDoctorSchema, updateDoctorSchema } from '../../validations/doctor.validation';

const router = Router();

router.use(requireAuth, checkSubscriptionActive);

router.post('/', checkSubscriptionLimits('maxDoctors'), validate(createDoctorSchema), doctorController.createDoctor);
router.get('/', doctorController.getDoctors);
router.get('/:id', doctorController.getDoctorById);
router.put('/:id', validate(updateDoctorSchema), doctorController.updateDoctor);
router.delete('/:id', doctorController.deleteDoctor);

// Leave routes
router.post('/:id/leaves', doctorController.createDoctorLeave);
router.get('/:id/leaves', doctorController.getDoctorLeaves);
router.delete('/:id/leaves/:leaveId', doctorController.deleteDoctorLeave);

export default router;
