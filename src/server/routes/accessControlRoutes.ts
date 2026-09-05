import { Router } from 'express';
import {
  getHardwareSpec,
  getAllCards,
  getCardDetails,
  createCard,
  activateCard,
  processCheckIn,
  processCheckOut,
  revokeCard,
  simulateEntry,
  getDoorAuditLogs,
} from '../controllers/accessControlController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { Role } from '@prisma/client';

const router = Router();

// Public / Reader endpoints for card tap verification
router.get('/cards/:cardId', getCardDetails);
router.post('/simulate-entry', simulateEntry);

// Protected Staff & Receptionist endpoints
router.use(authenticateToken);

router.get('/hardware-spec', requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF), getHardwareSpec);
router.get('/cards', requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF), getAllCards);
router.get('/logs', requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF), getDoorAuditLogs);
router.post('/cards/create', requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF), createCard);

router.post(
  '/cards/:cardId/activate',
  requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF),
  activateCard
);

router.post(
  '/cards/:cardId/checkin',
  requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF),
  processCheckIn
);

router.post(
  '/cards/:cardId/checkout',
  requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF),
  processCheckOut
);

router.post(
  '/cards/:cardId/revoke',
  requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF),
  revokeCard
);

export default router;
