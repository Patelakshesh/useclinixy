import { Router } from 'express';
import * as publicController from '../../controllers/public.controller';
import rateLimit from 'express-rate-limit';

const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 bookings per hour
  message: { success: false, message: 'Too many appointments booked from this IP. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

// No authentication required! These are consumer facing.
router.get('/:clinicId', publicController.getClinicDetails);
router.get('/:clinicId/doctors', publicController.getClinicDoctors);
router.get('/:clinicId/booked-slots', publicController.getBookedSlots);
router.post('/:clinicId/book', bookingLimiter, publicController.bookPublicAppointment);

export default router;
