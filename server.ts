import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';

import { getJwtSecret, isMemoryFallbackAllowed } from './src/server/config/envConfig';
import { checkDatabaseConnection } from './src/server/db/prisma';

import suiteRoutes from './src/server/routes/suiteRoutes';
import bookingRoutes from './src/server/routes/bookingRoutes';
import guestRoutes from './src/server/routes/guestRoutes';
import contactRoutes from './src/server/routes/contactRoutes';
import mediaRoutes from './src/server/routes/mediaRoutes';
import authRoutes from './src/server/routes/authRoutes';
import dashboardRoutes from './src/server/routes/dashboardRoutes';
import paymentRoutes from './src/server/routes/paymentRoutes';
import accessControlRoutes from './src/server/routes/accessControlRoutes';
import notificationRoutes from './src/server/routes/notificationRoutes';
import analyticsRoutes from './src/server/routes/analyticsRoutes';

import { requestLogger } from './src/server/middleware/logger';
import { errorHandler } from './src/server/middleware/errorHandler';
import { securityHeaders } from './src/server/middleware/securityHeaders';
import { apiGlobalRateLimiter } from './src/server/middleware/rateLimiter';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security Headers & CORS Configuration
  app.use(securityHeaders);
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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
      status: 'ok',
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

  // Error Handler Middleware for API routes
  app.use(errorHandler);

  // Vite middleware for development / Static file serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(
      express.static(distPath, {
        maxAge: '1d',
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      })
    );
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[KILIFA SUITES SERVER] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[KILIFA SUITES SERVER ERROR]', err);
  process.exit(1);
});
