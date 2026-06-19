import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('[Error]:', err.message || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode === 500 ? 'SERVER_ERROR' : 'BAD_REQUEST',
      message,
    },
  });
};
