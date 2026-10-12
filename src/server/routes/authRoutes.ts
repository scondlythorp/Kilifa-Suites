import { Router } from 'express';
import { login, register, forgotPassword, getMe, logout } from '../controllers/authController';
import { authenticateToken, authRateLimiter } from '../middleware/authMiddleware';

const router = Router();

// POST /api/auth/login
router.post('/login', authRateLimiter, login);

// POST /api/auth/register (Create Account)
router.post('/register', authRateLimiter, register);

// POST /api/auth/forgot-password (Reset Password)
router.post('/forgot-password', authRateLimiter, forgotPassword);

// GET /api/auth/me
router.get('/me', authenticateToken, getMe);

// POST /api/auth/logout
router.post('/logout', logout);

export default router;
