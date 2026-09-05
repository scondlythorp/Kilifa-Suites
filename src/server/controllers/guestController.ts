import { Request, Response, NextFunction } from 'express';
import { guestService } from '../services/guestService';
import { bookingService } from '../services/bookingService';
import { ApiError } from '../middleware/errorHandler';

export const getAllGuests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const guests = await guestService.getAllGuests();
    res.status(200).json({
      status: 'success',
      count: guests.length,
      data: guests,
    });
  } catch (err) {
    next(err);
  }
};

export const getGuestById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const guest = await guestService.getGuestById(id);
    res.status(200).json({
      status: 'success',
      data: guest,
    });
  } catch (err) {
    next(err);
  }
};

export const updateGuestProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { vipStatus, phone, country, fullName } = req.body;

    const updated = await guestService.updateGuestProfile(id, {
      vipStatus,
      phone,
      country,
      fullName,
    });

    res.status(200).json({
      status: 'success',
      message: 'Guest profile updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const updateSpecialRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;
    const { specialRequests } = req.body;

    if (typeof specialRequests !== 'string') {
      throw new ApiError(400, 'specialRequests string field is required');
    }

    const updatedBooking = await guestService.updateSpecialRequests(bookingId, specialRequests.trim());

    res.status(200).json({
      status: 'success',
      message: 'Special requests updated successfully',
      data: updatedBooking,
    });
  } catch (err) {
    next(err);
  }
};

export const checkInBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;
    const updated = await bookingService.updateBookingStatus(bookingId, 'CHECKED_IN');

    res.status(200).json({
      status: 'success',
      message: `Guest checked in successfully for reservation ${updated.bookingReference}`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const checkOutBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;
    const updated = await bookingService.updateBookingStatus(bookingId, 'CHECKED_OUT');

    res.status(200).json({
      status: 'success',
      message: `Guest checked out successfully for reservation ${updated.bookingReference}`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

