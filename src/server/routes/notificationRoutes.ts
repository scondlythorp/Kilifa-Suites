import { Router } from 'express';
import {
  getProvidersStatus,
  getAuditHistory,
  sendNotification,
  triggerBookingReminder,
} from '../controllers/notificationController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { Role } from '@prisma/client';

const router = Router();

// Public status check (so guests or admin preview can view provider setup status)
router.get('/providers', getProvidersStatus);

// Protected Staff & Admin endpoints
router.use(authenticateToken);

router.get('/history', requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF), getAuditHistory);
router.post('/send', requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF), sendNotification);
router.post('/trigger-reminder', requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF), triggerBookingReminder);

export default router;
