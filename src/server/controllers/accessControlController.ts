import { Request, Response, NextFunction } from 'express';
import { accessControlService } from '../services/accessControlService';
import { ApiError } from '../middleware/errorHandler';

export const getHardwareSpec = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const spec = accessControlService.getHardwareSpec();
    res.status(200).json({
      status: 'success',
      data: spec,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllCards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cards = await accessControlService.getAllCards();
    res.status(200).json({
      status: 'success',
      data: cards,
    });
  } catch (err) {
    next(err);
  }
};

export const getCardDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cardId } = req.params;
    const card = await accessControlService.getCardDetails(cardId);
    if (!card) {
      throw new ApiError(404, `Access card '${cardId}' not found`);
    }
    res.status(200).json({
      status: 'success',
      data: card,
    });
  } catch (err) {
    next(err);
  }
};

export const createCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId, bookingReference, guestName, suiteName, checkIn, checkOut } = req.body;

    if (!bookingId && !bookingReference) {
      throw new ApiError(400, 'bookingId or bookingReference is required');
    }

    const card = await accessControlService.createCardForBooking({
      bookingId: bookingId || '',
      bookingReference: bookingReference || '',
      guestName: guestName || 'Guest',
      suiteName: suiteName || 'Kilifa Suite',
      checkIn,
      checkOut,
    });

    res.status(201).json({
      status: 'success',
      message: 'Access card created (INACTIVE state) upon booking confirmation',
      data: card,
    });
  } catch (err) {
    next(err);
  }
};

export const activateCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cardId } = req.params;
    const card = await accessControlService.activateCard(cardId);

    res.status(200).json({
      status: 'success',
      message: 'Access card activated successfully in hardware lock controller',
      data: card,
    });
  } catch (err) {
    next(err);
  }
};

export const processCheckIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cardId } = req.params;
    const result = await accessControlService.processGuestCheckIn(cardId);

    res.status(200).json({
      status: 'success',
      message: 'Guest check-in processed. Suite door unlatched and access card active.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const processCheckOut = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cardId } = req.params;
    const result = await accessControlService.processGuestCheckOut(cardId);

    res.status(200).json({
      status: 'success',
      message: 'Guest checkout completed. Card credentials expired and unprogrammed from lock nodes.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const revokeCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cardId } = req.params;
    const { reason } = req.body;

    const card = await accessControlService.revokeCard(cardId, reason);

    res.status(200).json({
      status: 'success',
      message: 'Access card forcibly revoked in lock controller',
      data: card,
    });
  } catch (err) {
    next(err);
  }
};

export const simulateEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cardId, doorId, doorName } = req.body;

    if (!cardId) {
      throw new ApiError(400, 'cardId is required for door entry simulation');
    }

    const doorLog = await accessControlService.simulateDoorEntry({ cardId, doorId, doorName });

    res.status(200).json({
      status: 'success',
      message: doorLog.accessGranted ? 'Access GRANTED at lock reader' : 'Access DENIED at lock reader',
      data: doorLog,
    });
  } catch (err) {
    next(err);
  }
};

export const getDoorAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cardId } = req.query;
    const logs = await accessControlService.getDoorAuditLogs(cardId ? String(cardId) : undefined);

    res.status(200).json({
      status: 'success',
      data: logs,
    });
  } catch (err) {
    next(err);
  }
};
