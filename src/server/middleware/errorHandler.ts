import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
  statusCode: number;
  errors: string[];

  constructor(statusCode: number, message: string, errors: string[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = Array.isArray(errors) ? errors : [];
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

  if (err instanceof ApiError) {
    // 4xx errors are standard client-side validation, authentication, or conflict responses
    // Only 5xx errors represent unexpected server faults that belong in console.error
    if (err.statusCode >= 500) {
      console.error(`[API SERVER ERROR ${timestamp}] ${req.method} ${req.originalUrl}:`, err);
    }

    return res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
      errors: Array.isArray(err.errors) ? err.errors : [],
      path: req.originalUrl,
      timestamp,
    });
  }

  // Fallback for unhandled internal server errors
  console.error(`[UNHANDLED SERVER ERROR ${timestamp}] ${req.method} ${req.originalUrl}:`, err);

  const isProduction = process.env.NODE_ENV === 'production';
  return res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: isProduction ? 'An unexpected internal server error occurred. Please contact Kilifa Suites support.' : (err.message || 'Internal Server Error'),
    errors: [],
    path: req.originalUrl,
    timestamp,
  });
};
