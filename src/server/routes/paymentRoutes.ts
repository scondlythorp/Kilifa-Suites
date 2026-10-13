import { Router } from 'express';
import {
  getProviders,
  initiatePayment,
  recordPartialPayment,
  updatePaymentStatus,
  refundPayment,
  getAllPayments,
  handleWebhook,
} from '../controllers/paymentController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { strictActionRateLimiter } from '../middleware/rateLimiter';
import { Role } from '@prisma/client';

const router = Router();

// Public / Gateway endpoints for checkout flow & inbound webhooks
router.get('/providers', getProviders);
router.post('/initiate', strictActionRateLimiter, initiatePayment);
router.post('/webhook/:provider', strictActionRateLimiter, handleWebhook);

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
