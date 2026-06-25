import { Router } from 'express';
import { getAdminDashboardMetrics, getAllClinics, updateClinicStatus, deleteClinic, getAllSubscriptions, getAuditLogs, getPlansAdmin, createPlan, updatePlan, deletePlan, assignManualSubscription } from '../../controllers/admin.controller';
import { requireAuth, requireSuperAdmin } from '../../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth, requireSuperAdmin);

// Dashboard
router.get('/dashboard', getAdminDashboardMetrics);

// Clinics Management
router.get('/clinics', getAllClinics);
router.patch('/clinics/:id/status', updateClinicStatus);
router.delete('/clinics/:id', deleteClinic);
router.post('/clinics/:id/subscription', assignManualSubscription);

// Subscriptions (billing records)
router.get('/subscriptions', getAllSubscriptions);

// Audit Logs
router.get('/audit-logs', getAuditLogs);

// Plan Management (CRUD)
router.get('/plans', getPlansAdmin);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);

export default router;
