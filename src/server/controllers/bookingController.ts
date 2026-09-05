import { Request, Response, NextFunction } from 'express';
import { bookingService } from '../services/bookingService';
import { ApiError } from '../middleware/errorHandler';

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      fullName,
      email,
      phone,
      checkIn,
      checkOut,
      guestsCount,
      preferredSuite,
      specialRequests,
    } = req.body;

    const errors: string[] = [];

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      errors.push('fullName is required');
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.push('valid email address is required');
    }
    if (!phone || typeof phone !== 'string' || phone.trim().length < 5) {
      errors.push('valid phone number is required');
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
      if (start >= end) errors.push('checkOut date must be after checkIn date');
    }

    if (!guestsCount || typeof guestsCount !== 'number' || guestsCount < 1) {
      errors.push('guestsCount must be at least 1');
    }

    if (!preferredSuite || typeof preferredSuite !== 'string') {
      errors.push('preferredSuite is required');
    }

    if (errors.length > 0) {
      throw new ApiError(400, 'Validation Failed', errors);
    }

    const booking = await bookingService.createBooking({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      checkIn,
      checkOut,
      guestsCount,
      preferredSuite,
      specialRequests: specialRequests ? String(specialRequests).trim() : '',
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
    const booking = await bookingService.getBookingById(id);
    res.status(200).json({
      status: 'success',
      data: booking,
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
