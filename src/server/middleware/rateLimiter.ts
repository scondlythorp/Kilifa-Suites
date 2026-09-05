import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

interface RateLimitStoreRecord {
  count: number;
  resetTime: number;
}

export const createRateLimiter = (config: RateLimitConfig) => {
  const store = new Map<string, RateLimitStoreRecord>();

  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown-ip';

    const now = Date.now();
    const record = store.get(clientIp);

    if (!record || now > record.resetTime) {
      store.set(clientIp, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return next();
    }

    record.count += 1;

    if (record.count > config.maxRequests) {
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      return next(
        new ApiError(
          429,
          config.message || `Too many requests from this IP. Please wait ${retryAfterSec} seconds.`
        )
      );
    }

    next();
  };
};

// Preset Rate Limiters
export const apiGlobalRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 120, // 120 requests per minute
  message: 'Global API rate limit exceeded. Please slow down your requests.',
});

export const strictActionRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 25, // 25 actions per 15 minutes (booking, contact, payments)
  message: 'Action rate limit exceeded. Please wait a few minutes before trying again.',
});
