import { Request, Response, NextFunction } from 'express';

// Middleware to ensure that every request to a tenant route has a valid clinicId context
export const requireTenantContext = (req: Request, res: Response, next: NextFunction): void => {
  // If Super Admin accesses a tenant route, they MUST specify the clinicId in the header or query
  // For normal Clinic Admins, the clinicId is inherently tied to their JWT token.
  
  let clinicId = req.user?.clinicId;

  if (req.user?.role === 'SUPER_ADMIN') {
    clinicId = (req.headers['x-clinic-id'] as string) || (req.query.clinicId as string);
  }

  if (!clinicId) {
    res.status(400).json({ success: false, message: 'Tenant context (clinicId) is missing. Access denied.' });
    return;
  }

  // Inject the resolved clinicId into the request object for downstream controllers to safely use
  req.tenantId = clinicId;
  next();
};

// Extend Express Request interface to include tenantId
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}
