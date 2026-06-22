import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('[Error]:', err.message || err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle MongoDB Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    
    // Map internal field names to user-friendly messages
    if (field === 'mobileNumber') {
      message = `A patient with the mobile number ${value} already exists in your clinic.`;
    } else if (field === 'email') {
      message = `The email ${value} is already in use.`;
    } else {
      message = `A record with ${field} '${value}' already exists.`;
    }
  } else if (err.name === 'ValidationError') {
    // Handle Mongoose Validation Errors
    statusCode = 400;
    message = Object.values(err.errors).map((val: any) => val.message).join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message, // Adding this to match frontend expectations
    error: {
      code: statusCode === 500 ? 'SERVER_ERROR' : 'BAD_REQUEST',
      message,
    },
  });
};
