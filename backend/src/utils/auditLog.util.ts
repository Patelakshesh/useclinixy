import AuditLog from '../models/auditLog.model';
import mongoose from 'mongoose';

/**
 * Write an audit log entry. Fails silently to never block the main request flow.
 */
export const logAudit = async (
  userId: string | mongoose.Types.ObjectId,
  action: string,
  details: Record<string, any> = {},
  clinicId?: string | mongoose.Types.ObjectId | null,
  ipAddress?: string
): Promise<void> => {
  try {
    await AuditLog.create({
      userId,
      action,
      details,
      clinicId: clinicId || null,
      ipAddress: ipAddress || 'unknown',
    });
  } catch (err) {
    // Never throw — audit log failure must not break main operations
    console.error('[AuditLog] Failed to write audit log:', err);
  }
};
