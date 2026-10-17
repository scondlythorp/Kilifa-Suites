import { Router } from 'express';
import {
  createBooking,
  getBookingById,
  getAllBookings,
  updateBookingStatus,
} from '../controllers/bookingController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { strictActionRateLimiter } from '../middleware/rateLimiter';
import { Role } from '@prisma/client';

const router = Router();

// POST /api/bookings - Public endpoint for guest booking requests with rate limiting
router.post('/', strictActionRateLimiter, createBooking);

// Protected booking management endpoints
// GET /api/bookings - Staff, Receptionist, Admin, Owner access
router.get(
  '/',
  authenticateToken,
  requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF),
  getAllBookings
);

// GET /api/bookings/:id - Protected: Owner, Admin, Receptionist, Staff access only
router.get(
  '/:id',
  authenticateToken,
  requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF),
  getBookingById
);

// PATCH /api/bookings/:id/status - Update booking status
router.patch(
  '/:id/status',
  authenticateToken,
  requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF),
  updateBookingStatus
);

export default router;
