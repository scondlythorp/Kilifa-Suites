import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notificationService';
import { ApiError } from '../middleware/errorHandler';
import { NotificationChannel, NotificationType } from '../notifications/types';

export const getProvidersStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const statuses = notificationService.getProvidersStatus();
    res.status(200).json({
      status: 'success',
      data: statuses,
    });
  } catch (err) {
    next(err);
  }
};

export const getAuditHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 50;
    const history = notificationService.getAuditHistory(limit);
    res.status(200).json({
      status: 'success',
      data: history,
    });
  } catch (err) {
    next(err);
  }
};

export const sendNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, channels, recipient, bookingReference, suiteName, checkInDate, checkOutDate, amount, accessPin, cardNumber, customMessage } = req.body;

    if (!type || !recipient) {
      throw new ApiError(400, 'Notification type and recipient (email/phone) are required');
    }

    const results = await notificationService.sendNotification(
      {
        type: type as NotificationType,
        recipient,
        bookingReference,
        suiteName,
        checkInDate,
        checkOutDate,
        amount,
        accessPin,
        cardNumber,
        customMessage,
      },
      channels as NotificationChannel[]
    );

    res.status(200).json({
      status: 'success',
      message: `Notification dispatch processed across ${results.length} channel(s)`,
      data: results,
    });
  } catch (err) {
    next(err);
  }
};

export const triggerBookingReminder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reminderType, email, phone, fullName, bookingReference, suiteName, checkIn, checkOut, cardNumber, pinCode } = req.body;

    if (!reminderType || !email || !fullName) {
      throw new ApiError(400, 'reminderType, email, and fullName are required');
    }

    let results;
    switch (reminderType) {
      case 'CHECK_IN_REMINDER':
        results = await notificationService.notifyCheckInReminder({
          email,
          phone: phone || '+2207000000',
          fullName,
          bookingReference: bookingReference || 'KS-REF',
          suiteName: suiteName || 'Kilifa Suite',
          checkIn: checkIn || new Date().toISOString(),
        });
        break;

      case 'CHECK_OUT_REMINDER':
        results = await notificationService.notifyCheckOutReminder({
          email,
          phone: phone || '+2207000000',
          fullName,
          bookingReference: bookingReference || 'KS-REF',
          suiteName: suiteName || 'Kilifa Suite',
          checkOut: checkOut || new Date().toISOString(),
        });
        break;

      case 'ACCESS_CARD_INFO':
        results = await notificationService.notifyAccessCardInfo({
          email,
          phone: phone || '+2207000000',
          fullName,
          bookingReference: bookingReference || 'KS-REF',
          suiteName: suiteName || 'Kilifa Suite',
          cardNumber: cardNumber || 'AC-KS-0102',
          pinCode: pinCode || '7821',
        });
        break;

      default:
        throw new ApiError(400, `Unsupported reminder type: ${reminderType}`);
    }

    res.status(200).json({
      status: 'success',
      message: `${reminderType} notification dispatched successfully`,
      data: results,
    });
  } catch (err) {
    next(err);
  }
};
