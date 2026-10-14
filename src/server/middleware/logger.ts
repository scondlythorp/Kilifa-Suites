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

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`
    );
  });

  next();
};
