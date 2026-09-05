import { Request, Response, NextFunction } from 'express';

export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Protect against MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Cross-site scripting filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Strict Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Disable powered by header
  res.removeHeader('X-Powered-By');

  next();
};
