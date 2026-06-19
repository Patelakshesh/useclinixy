import { Router } from 'express';
import * as appointmentController from '../../controllers/appointment.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { checkSubscriptionActive } from '../../middlewares/subscription.middleware';
import { createAppointmentSchema, updateAppointmentStatusSchema } from '../../validations/appointment.validation';

const router = Router();

router.use(requireAuth, checkSubscriptionActive);

router.post('/', validate(createAppointmentSchema), appointmentController.createAppointment);
router.get('/', appointmentController.getAppointments);
router.get('/calendar', appointmentController.getCalendarAppointments);
router.put('/:id', validate(createAppointmentSchema), appointmentController.updateAppointment);
router.patch('/:id/status', validate(updateAppointmentStatusSchema), appointmentController.updateAppointmentStatus);
router.delete('/:id', appointmentController.deleteAppointment);

export default router;
