import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt.util';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    let token = req.cookies.token;
    
    // Fallback to Bearer token
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'SUPER_ADMIN') {
    res.status(403).json({ success: false, message: 'Super Admin access required' });
    return;
  }
  next();
};

export const requireClinicAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'CLINIC_ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
    res.status(403).json({ success: false, message: 'Clinic Admin access required' });
    return;
  }
  next();
};
