import { Router } from 'express';
import {
  login,
  register,
  forgotPassword,
  resetPassword,
  getMe,
  logout,
} from '../controllers/authController';
import { authenticateToken, requireRole, authRateLimiter } from '../middleware/authMiddleware';
import { Role } from '@prisma/client';

const router = Router();

// POST /api/auth/login - Rate limited login endpoint
router.post('/login', authRateLimiter, login);

// POST /api/auth/register - PROTECTED: Requires authenticated System Admin
router.post('/register', authenticateToken, requireRole(Role.ADMIN), register);

// POST /api/auth/forgot-password - Rate limited request for reset token
router.post('/forgot-password', authRateLimiter, forgotPassword);

// POST /api/auth/reset-password - Rate limited reset with cryptographically verified token
router.post('/reset-password', authRateLimiter, resetPassword);

// GET /api/auth/me - Authenticated profile verification
router.get('/me', authenticateToken, getMe);

// POST /api/auth/logout - Session termination
router.post('/logout', logout);

export default router;
