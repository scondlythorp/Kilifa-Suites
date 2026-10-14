import { Router } from 'express';
import {
  getProviders,
  initiatePayment,
  recordPartialPayment,
  updatePaymentStatus,
  refundPayment,
  getAllPayments,
} from '../controllers/paymentController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { strictActionRateLimiter } from '../middleware/rateLimiter';
import { Role } from '@prisma/client';

const router = Router();

// Public / Guest endpoints for checkout flow
router.get('/providers', getProviders);
router.post('/initiate', strictActionRateLimiter, initiatePayment);

// Protected Admin / Receptionist endpoints
router.use(authenticateToken);

router.get('/', requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF), getAllPayments);

router.post(
  '/:paymentId/partial',
  requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST),
  recordPartialPayment
);

router.patch(
  '/:paymentId/status',
  requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST),
  updatePaymentStatus
);

router.post(
  '/:paymentId/refund',
  requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST),
  refundPayment
);

export default router;
