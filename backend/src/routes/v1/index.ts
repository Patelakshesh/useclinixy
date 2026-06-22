import { Router } from 'express';
import authRoutes from './auth.routes';
import doctorRoutes from './doctor.routes';
import patientRoutes from './patient.routes';
import appointmentRoutes from './appointment.routes';
import dashboardRoutes from './dashboard.routes';
import clinicRoutes from './clinic.routes';
import prescriptionRoutes from './prescription.routes';
import adminRoutes from './admin.routes';
import subscriptionRoutes from './subscription.routes';
import paymentRoutes from './payment.routes';
import publicRoutes from './public.routes';
import staffRoutes from './staff.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/doctors', doctorRoutes);
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/clinic', clinicRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/admin', adminRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/payments', paymentRoutes);
router.use('/public', publicRoutes);
router.use('/staff', staffRoutes);

export default router;
