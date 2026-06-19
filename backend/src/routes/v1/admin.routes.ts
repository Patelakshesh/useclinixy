import { Router } from 'express';
import { getAdminDashboardMetrics, getAllClinics, updateClinicStatus, getAllSubscriptions, getAuditLogs, getPlansAdmin, createPlan, updatePlan, deletePlan } from '../../controllers/admin.controller';
import { requireAuth, requireSuperAdmin } from '../../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth, requireSuperAdmin);

// Dashboard
router.get('/dashboard', getAdminDashboardMetrics);

// Clinics Management
router.get('/clinics', getAllClinics);
router.patch('/clinics/:id/status', updateClinicStatus);

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
