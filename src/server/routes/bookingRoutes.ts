import { Router } from 'express';
import {
  createBooking,
  getBookingById,
  getAllBookings,
  updateBookingStatus,
  lookupBooking,
} from '../controllers/bookingController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { strictActionRateLimiter } from '../middleware/rateLimiter';
import { Role } from '@prisma/client';

const router = Router();

// POST /api/bookings - Public endpoint for guest booking requests with rate limiting
router.post('/', strictActionRateLimiter, createBooking);

// GET /api/bookings/lookup/:bookingReference - Public endpoint for guests to check booking status
router.get('/lookup/:bookingReference', strictActionRateLimiter, lookupBooking);

// Protected booking management endpoints
// GET /api/bookings - Staff, Receptionist, Admin, Owner access
router.get(
  '/',
  authenticateToken,
  requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF),
  getAllBookings
);

// GET /api/bookings/:id - Protected
router.get('/:id', authenticateToken, getBookingById);

// PATCH /api/bookings/:id/status - Update booking status
router.patch(
  '/:id/status',
  authenticateToken,
  requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF),
  updateBookingStatus
);

export default router;
