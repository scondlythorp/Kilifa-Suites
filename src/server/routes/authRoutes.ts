import { Router } from 'express';
import { login, getMe, logout } from '../controllers/authController';
import { authenticateToken, authRateLimiter } from '../middleware/authMiddleware';

const router = Router();

// POST /api/auth/login
router.post('/login', authRateLimiter, login);

// GET /api/auth/me
router.get('/me', authenticateToken, getMe);

// POST /api/auth/logout
router.post('/logout', logout);

export default router;
