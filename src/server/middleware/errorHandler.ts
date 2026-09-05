import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
  statusCode: number;
  errors?: string[];

  constructor(statusCode: number, message: string, errors?: string[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  const timestamp = new Date().toISOString();
  console.error(`[API ERROR ${timestamp}] ${req.method} ${req.originalUrl}:`, err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors || [],
      path: req.originalUrl,
      timestamp,
    });
  }

  // Fallback for unhandled internal server errors
  return res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: err.message || 'Internal Server Error',
    path: req.originalUrl,
    timestamp,
  });
};
