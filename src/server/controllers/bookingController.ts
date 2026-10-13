import { Request, Response, NextFunction } from 'express';
import { bookingService } from '../services/bookingService';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authMiddleware';
import { Role } from '@prisma/client';

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      fullName,
      email,
      phone,
      checkIn,
      checkOut,
      guestsCount,
      suiteId,
      preferredSuite,
      specialRequests,
      idempotencyKey,
    } = req.body;

    const errors: string[] = [];

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      errors.push('fullName is required');
    } else if (fullName.trim().length < 2 || fullName.trim().length > 100) {
      errors.push('fullName must be between 2 and 100 characters');
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.push('valid email address is required');
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 5 || phone.trim().length > 30) {
      errors.push('valid phone number between 5 and 30 characters is required');
    }

    if (!checkIn || typeof checkIn !== 'string') {
      errors.push('checkIn date is required (YYYY-MM-DD)');
    }

    if (!checkOut || typeof checkOut !== 'string') {
      errors.push('checkOut date is required (YYYY-MM-DD)');
    }

    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      if (isNaN(start.getTime())) errors.push('invalid checkIn date format');
      if (isNaN(end.getTime())) errors.push('invalid checkOut date format');

      const todayStr = new Date().toISOString().split('T')[0];
      if (checkIn < todayStr) {
        errors.push('checkIn date cannot be in the past');
      }

      if (checkIn >= checkOut) {
        errors.push('checkOut date must be strictly after checkIn date');
      }
    }

    const parsedGuests = Number(guestsCount);
    if (isNaN(parsedGuests) || parsedGuests < 1 || !Number.isInteger(parsedGuests)) {
      errors.push('guestsCount must be an integer of at least 1');
    }

    const targetSuiteId = (suiteId || preferredSuite)?.toString().trim();
    if (!targetSuiteId) {
      errors.push('suiteId is required');
    }

    if (errors.length > 0) {
      throw new ApiError(400, 'Validation Failed', errors);
    }

    const headerIdempotency = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
    const resolvedIdempotencyKey = typeof headerIdempotency === 'string'
      ? headerIdempotency.trim()
      : (typeof idempotencyKey === 'string' ? idempotencyKey.trim() : undefined);

    const booking = await bookingService.createBooking({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      checkIn,
      checkOut,
      guestsCount: parsedGuests,
      suiteId: targetSuiteId!,
      preferredSuite: targetSuiteId!,
      specialRequests: specialRequests ? String(specialRequests).trim() : '',
      idempotencyKey: resolvedIdempotencyKey,
    });

    res.status(201).json({
      status: 'success',
      message: 'Thank you. Your booking request has been received. Our team will contact you to confirm availability and your reservation.',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const authReq = req as AuthRequest;
    const booking = await bookingService.getBookingById(id);

    // Enforce booking ownership: Non-staff users (e.g. guests) can ONLY view their own bookings
    const staffRoles: Role[] = [Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF];
    if (authReq.user && !staffRoles.includes(authReq.user.role)) {
      const userEmail = authReq.user.email?.toLowerCase();
      const bookingEmail = booking.email?.toLowerCase();
      if (!userEmail || !bookingEmail || userEmail !== bookingEmail) {
        throw new ApiError(403, "Access denied. You are not authorized to view another guest's booking details.");
      }
    }

    res.status(200).json({
      status: 'success',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

export const lookupBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingReference } = req.params;
    const email = (req.query.email as string)?.trim().toLowerCase();

    if (!bookingReference) {
      throw new ApiError(400, 'Booking reference is required');
    }

    if (!email) {
      throw new ApiError(400, 'Guest email address is required to look up a reservation.');
    }

    const booking = await bookingService.getBookingById(bookingReference);

    if (booking.email.toLowerCase() !== email) {
      throw new ApiError(404, 'No matching booking found for the provided reference and email address.');
    }

    res.status(200).json({
      status: 'success',
      data: {
        bookingReference: booking.bookingReference,
        fullName: booking.fullName,
        suiteName: booking.suiteName,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guestsCount: booking.guestsCount,
        totalNights: booking.totalNights,
        totalEstimatedPrice: booking.totalEstimatedPrice,
        status: booking.status,
        paymentStatus: booking.payment?.status || 'PENDING',
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await bookingService.getAllBookings();
    res.status(200).json({
      status: 'success',
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || typeof status !== 'string') {
      throw new ApiError(400, 'Status field is required');
    }

    const updated = await bookingService.updateBookingStatus(id, status);

    res.status(200).json({
      status: 'success',
      message: `Booking status updated to '${status.toUpperCase()}'`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};
