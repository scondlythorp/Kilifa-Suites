import express from 'express';
import path from 'path';
import cors from 'cors';
import { getJwtSecret, isMemoryFallbackAllowed } from './config/envConfig';
import { checkDatabaseConnection, isDatabaseConnected } from './db/prisma';

import suiteRoutes from './routes/suiteRoutes';
import bookingRoutes from './routes/bookingRoutes';
import guestRoutes from './routes/guestRoutes';
import contactRoutes from './routes/contactRoutes';
import mediaRoutes from './routes/mediaRoutes';
import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import paymentRoutes from './routes/paymentRoutes';
import accessControlRoutes from './routes/accessControlRoutes';
import notificationRoutes from './routes/notificationRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

import { requestLogger } from './middleware/logger';
import { errorHandler, ApiError } from './middleware/errorHandler';
import { securityHeaders } from './middleware/securityHeaders';
import { apiGlobalRateLimiter } from './middleware/rateLimiter';

export function createExpressApp() {
  const app = express();

  // Trust first proxy for client IP rate limiting in Cloud Run / Vercel
  app.set('trust proxy', 1);

  // Security Headers & CORS Configuration
  app.use(securityHeaders);

  const rawCorsOrigin = process.env.CORS_ORIGIN;
  const allowedOrigins = rawCorsOrigin
    ? rawCorsOrigin.split(',').map((s) => s.trim()).filter(Boolean)
    : [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'https://kilifasuites.com',
        'https://www.kilifasuites.com',
      ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, health-checks)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // In non-production, allow all localhost and 127.0.0.1 variations
        if (
          process.env.NODE_ENV !== 'production' &&
          (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin))
        ) {
          return callback(null, true);
        }

        // Allow Cloud Run, Google preview domains, and Vercel deployments
        if (
          origin.endsWith('.run.app') ||
          origin.endsWith('.google.com') ||
          origin.endsWith('.googleusercontent.com') ||
          origin.endsWith('.vercel.app')
        ) {
          return callback(null, true);
        }

        // In non-production environments, allow any origin to ensure preview works seamlessly
        if (process.env.NODE_ENV !== 'production') {
          return callback(null, true);
        }

        callback(null, false);
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Idempotency-Key', 'X-Idempotency-Key'],
      credentials: true,
    })
  );

  // Request Body Payload Size Protection
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(requestLogger);

  // Global API Rate Limiting
  app.use('/api', apiGlobalRateLimiter);

  // Validate security configuration on startup
  try {
    getJwtSecret();
  } catch (err: any) {
    console.error('[CRITICAL SECURITY ERROR]', err.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  // Health check endpoint
  app.get('/api/health', async (req, res) => {
    const isDbConnected = await checkDatabaseConnection();
    res.status(200).json({
      status: isDbConnected ? 'ok' : 'degraded',
      service: 'Kilifa Suites API',
      databaseConnected: isDbConnected,
      memoryFallbackAllowed: isMemoryFallbackAllowed(),
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/suites', suiteRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/guests', guestRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/media', mediaRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/access', accessControlRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/analytics', analyticsRoutes);

  // Serve /media static directory directly with byte-range and caching support
  app.use(
    '/media',
    express.static(path.join(process.cwd(), 'public/media'), {
      maxAge: '1d',
      acceptRanges: true,
    })
  );
  app.use(
    '/images',
    express.static(path.join(process.cwd(), 'public/media/images'), {
      maxAge: '1d',
    })
  );
  app.use(
    '/videos',
    express.static(path.join(process.cwd(), 'public/media/videos'), {
      maxAge: '1d',
      acceptRanges: true,
    })
  );

  // Unmatched API routes return 404 JSON error, preventing fallthrough to HTML index
  app.all('/api/*', (req, res, next) => {
    next(new ApiError(404, `API route '${req.method} ${req.originalUrl}' not found`));
  });

  // Error Handler Middleware for API routes
  app.use(errorHandler);

  return app;
}

export const app = createExpressApp();
export default app;
