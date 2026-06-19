import { Router } from 'express';
import * as patientController from '../../controllers/patient.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { checkSubscriptionLimits, checkSubscriptionActive } from '../../middlewares/subscription.middleware';
import { createPatientSchema, updatePatientSchema } from '../../validations/patient.validation';

const router = Router();

router.use(requireAuth, checkSubscriptionActive);

router.post('/', checkSubscriptionLimits('maxPatients'), validate(createPatientSchema), patientController.createPatient);
router.get('/', patientController.getPatients);
router.get('/:id', patientController.getPatientById);
router.put('/:id', validate(updatePatientSchema), patientController.updatePatient);
router.delete('/:id', patientController.deletePatient);

// Medical History
router.post('/:id/history', patientController.addMedicalHistory);
router.get('/:id/history', patientController.getMedicalHistory);
router.delete('/:id/history/:historyId', patientController.deleteMedicalHistory);

// Vitals
router.post('/:id/vitals', patientController.addVitals);
router.get('/:id/vitals', patientController.getVitals);
router.delete('/:id/vitals/:vitalsId', patientController.deleteVitals);

export default router;
