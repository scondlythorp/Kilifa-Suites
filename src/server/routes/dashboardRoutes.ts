import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.get(
  '/stats',
  authenticateToken,
  requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF),
  getDashboardStats
);

export default router;
