import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { ApiError } from './errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'kilifa_suites_jwt_secret_key_2026_super_secure';

export interface JWTPayload {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

/**
 * Middleware to verify JWT Bearer token in Authorization header
 */
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return next(new ApiError(401, 'Authentication required. Please provide a valid Bearer token.'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch (err) {
    return next(new ApiError(401, 'Invalid or expired authentication token. Please log in again.'));
  }
};

/**
 * Role-Based Access Control (RBAC) middleware
 */
export const requireRole = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required before accessing this endpoint.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied. Role '${req.user.role}' is not authorized to access this resource. Required role(s): [${allowedRoles.join(', ')}].`
        )
      );
    }

    next();
  };
};

/**
 * Rate Limiting Foundation Middleware
 * Prevents brute force credential attacks on auth endpoints
 */
interface RateLimitRecord {
  count: number;
  firstRequestTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 15; // 15 login attempts per window

export const authRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-ip';
  const now = Date.now();
  const record = rateLimitStore.get(clientIp);

  if (!record) {
    rateLimitStore.set(clientIp, { count: 1, firstRequestTime: now });
    return next();
  }

  if (now - record.firstRequestTime > WINDOW_MS) {
    // Reset window
    rateLimitStore.set(clientIp, { count: 1, firstRequestTime: now });
    return next();
  }

  record.count += 1;
  if (record.count > MAX_REQUESTS) {
    const retryAfterSec = Math.ceil((WINDOW_MS - (now - record.firstRequestTime)) / 1000);
    res.setHeader('Retry-After', retryAfterSec);
    return next(
      new ApiError(
        429,
        `Too many authentication attempts from this IP. Please try again in ${retryAfterSec} seconds.`
      )
    );
  }

  next();
};
