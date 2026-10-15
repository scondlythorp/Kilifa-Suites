import { Router } from 'express';
import { login, register, forgotPassword, resetPassword, getMe, logout } from '../controllers/authController';
import { authenticateToken, requireRole, authRateLimiter } from '../middleware/authMiddleware';
import { Role } from '@prisma/client';

const router = Router();

// POST /api/auth/login
router.post('/login', authRateLimiter, login);
router.get('/login', (req, res) => {
  res.status(200).json({ status: 'ok', endpoint: '/api/auth/login', methods: ['POST'] });
});

// POST /api/auth/register (Create Staff/Admin Account - Strictly Protected)
router.post(
  '/register',
  authenticateToken,
  requireRole(Role.ADMIN, Role.OWNER),
  register
);

// POST /api/auth/forgot-password (Initiate Single-Use Password Reset Request)
router.post('/forgot-password', authRateLimiter, forgotPassword);

// POST /api/auth/reset-password (Execute Password Reset with Verified Token)
router.post('/reset-password', authRateLimiter, resetPassword);

// GET /api/auth/me
router.get('/me', authenticateToken, getMe);

// POST /api/auth/logout
router.post('/logout', logout);
router.get('/logout', logout);

export default router;
