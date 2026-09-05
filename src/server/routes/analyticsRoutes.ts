import { Router } from 'express';
import { getAnalyticsReport } from '../controllers/analyticsController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.get(
  '/report',
  authenticateToken,
  requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF),
  getAnalyticsReport
);

export default router;
