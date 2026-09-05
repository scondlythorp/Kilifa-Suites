import { Router } from 'express';
import {
  getAllMedia,
  createMedia,
  updateMedia,
  deleteMedia,
  togglePublishMedia,
} from '../controllers/mediaController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { Role } from '@prisma/client';

const router = Router();

// GET /api/media - Public or authenticated
router.get('/', getAllMedia);

// Protected media management endpoints
router.post(
  '/',
  authenticateToken,
  requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST),
  createMedia
);

router.put(
  '/:id',
  authenticateToken,
  requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST),
  updateMedia
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole(Role.OWNER, Role.ADMIN),
  deleteMedia
);

router.patch(
  '/:id/publish',
  authenticateToken,
  requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST),
  togglePublishMedia
);

export default router;
