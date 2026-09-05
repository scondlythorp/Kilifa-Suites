import { Router } from 'express';
import {
  createContactMessage,
  getAllContactMessages,
} from '../controllers/contactController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { strictActionRateLimiter } from '../middleware/rateLimiter';
import { Role } from '@prisma/client';

const router = Router();

// POST /api/contact - Public contact form submission with rate limiting
router.post('/', strictActionRateLimiter, createContactMessage);

// GET /api/contact - Owner and Admin access only
router.get(
  '/',
  authenticateToken,
  requireRole(Role.OWNER, Role.ADMIN),
  getAllContactMessages
);

export default router;
