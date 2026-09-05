import { Router } from 'express';
import {
  getAllSuites,
  getSuiteById,
  createSuite,
  updateSuite,
  deleteSuite,
} from '../controllers/suiteController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { Role } from '@prisma/client';

const router = Router();

// Public read endpoints
router.get('/', getAllSuites);
router.get('/:id', getSuiteById);

// Protected management endpoints
router.post(
  '/',
  authenticateToken,
  requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST),
  createSuite
);

router.put(
  '/:id',
  authenticateToken,
  requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST),
  updateSuite
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole(Role.OWNER, Role.ADMIN),
  deleteSuite
);

export default router;
