import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Skip logging internal Vite module/asset requests to keep server logs clean
  if (
    req.originalUrl.startsWith('/src/') ||
    req.originalUrl.startsWith('/@') ||
    req.originalUrl.startsWith('/node_modules/') ||
    req.originalUrl.includes('.tsx') ||
    req.originalUrl.includes('.ts') ||
    req.originalUrl.includes('.js') ||
    req.originalUrl.includes('.css')
  ) {
    return next();
  }

  const start = Date.now();
  const timestamp = new Date().toISOString();

  // Sanitize query parameters to protect guest PII, tokens, and credentials
  const sanitizedUrl = req.originalUrl.replace(
    /([?&](?:email|token|key|secret|password|card|cvv)=)[^&]*/gi,
    '$1[REDACTED]'
  );

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${timestamp}] ${req.method} ${sanitizedUrl} - Status: ${res.statusCode} (${duration}ms)`
    );
  });

  next();
};
