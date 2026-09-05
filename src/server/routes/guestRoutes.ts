import { Router } from 'express';
import {
  getAllGuests,
  getGuestById,
  updateGuestProfile,
  updateSpecialRequests,
  checkInBooking,
  checkOutBooking,
} from '../controllers/guestController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { Role } from '@prisma/client';

const router = Router();

// Protect all guest admin endpoints
router.use(authenticateToken);

// GET /api/guests - Admin/Receptionist/Staff access
router.get('/', requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF), getAllGuests);

// GET /api/guests/:id - Admin/Receptionist/Staff access
router.get('/:id', requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF), getGuestById);

// PATCH /api/guests/:id - Update guest profile (VIP status, contact info, country)
router.patch('/:id', requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST), updateGuestProfile);

// PATCH /api/guests/bookings/:bookingId/special-requests - Update special requests
router.patch(
  '/bookings/:bookingId/special-requests',
  requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF),
  updateSpecialRequests
);

// POST /api/guests/bookings/:bookingId/check-in - Process Guest Check-in
router.post(
  '/bookings/:bookingId/check-in',
  requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF),
  checkInBooking
);

// POST /api/guests/bookings/:bookingId/check-out - Process Guest Check-out
router.post(
  '/bookings/:bookingId/check-out',
  requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF),
  checkOutBooking
);

export default router;

