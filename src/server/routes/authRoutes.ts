import { Router } from 'express';
import { login, register, forgotPassword, getMe, logout } from '../controllers/authController';
import { authenticateToken, authRateLimiter } from '../middleware/authMiddleware';

const router = Router();

// POST /api/auth/login
router.post('/login', authRateLimiter, login);
router.get('/login', (req, res) => {
  res.status(200).json({ status: 'ok', endpoint: '/api/auth/login', methods: ['POST'] });
});

// POST /api/auth/register (Create Account)
router.post('/register', authRateLimiter, register);
router.get('/register', (req, res) => {
  res.status(200).json({ status: 'ok', endpoint: '/api/auth/register', methods: ['POST'] });
});

// POST /api/auth/forgot-password (Reset Password)
router.post('/forgot-password', authRateLimiter, forgotPassword);
router.get('/forgot-password', (req, res) => {
  res.status(200).json({ status: 'ok', endpoint: '/api/auth/forgot-password', methods: ['POST'] });
});

// GET /api/auth/me
router.get('/me', authenticateToken, getMe);

// POST /api/auth/logout
router.post('/logout', logout);
router.get('/logout', logout);

export default router;
