import { Router } from 'express';
import * as prescriptionController from '../../controllers/prescription.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { prescriptionSchema } from '../../validations/prescription.validation';

const router = Router();

router.use(requireAuth);

router.post('/', validate(prescriptionSchema), prescriptionController.createPrescription);
router.get('/appointment/:appointmentId', prescriptionController.getPrescriptionByAppointment);
router.get('/patient/:patientId', prescriptionController.getPatientPrescriptions);
router.put('/:id', validate(prescriptionSchema), prescriptionController.updatePrescription);
router.delete('/:id', prescriptionController.deletePrescription);

export default router;
