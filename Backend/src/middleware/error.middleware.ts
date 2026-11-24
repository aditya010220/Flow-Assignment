import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected internal server error occurred.';

  console.error(`[API Error] ${req.method} ${req.path} -> ${statusCode} [${errorCode}]: ${message}`);

  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      details: err.details || undefined,
    },
  });
}
