import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/paymentService';
import { ApiError } from '../middleware/errorHandler';

export const getProviders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const providers = paymentService.getAvailableProviders();
    res.status(200).json({
      status: 'success',
      data: providers,
    });
  } catch (err) {
    next(err);
  }
};

export const initiatePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      bookingId,
      bookingReference,
      amount,
      paidAmount,
      currency,
      provider,
      guestName,
      guestEmail,
      guestPhone,
      mobileWalletNumber,
      cardToken,
      notes,
    } = req.body;

    if (!provider) {
      throw new ApiError(400, 'Payment provider is required (WAVE, AFRIMONEY, APS_WALLET, VISA_CARD, PAYPAL, CASH, BANK_TRANSFER)');
    }

    if (!bookingId && !bookingReference) {
      throw new ApiError(400, 'bookingId or bookingReference is required');
    }

    // Security check: Reject raw card payload
    if (req.body.cardNumber || req.body.cvv || req.body.rawCard) {
      throw new ApiError(400, 'Security Violation: Raw card numbers and CVVs are strictly forbidden.');
    }

    const result = await paymentService.initiatePayment({
      bookingId: bookingId || '',
      bookingReference: bookingReference || '',
      amount: Number(amount || 0),
      paidAmount: paidAmount !== undefined ? Number(paidAmount) : undefined,
      currency: currency || 'GMD',
      provider,
      guestName: guestName || 'Guest',
      guestEmail: guestEmail || 'guest@kilifasuites.gm',
      guestPhone: guestPhone || '+220000000',
      mobileWalletNumber,
      cardToken,
      notes,
    });

    res.status(200).json({
      status: 'success',
      message: `Payment initialized via ${provider}`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const recordPartialPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentId } = req.params;
    const { paidAmount, notes } = req.body;

    if (!paidAmount || Number(paidAmount) <= 0) {
      throw new ApiError(400, 'Valid positive paidAmount is required');
    }

    const result = await paymentService.recordPartialPayment(paymentId, Number(paidAmount), notes);

    res.status(200).json({
      status: 'success',
      message: 'Partial payment recorded successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const updatePaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentId } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      throw new ApiError(400, 'Payment status is required');
    }

    const updated = await paymentService.updatePaymentStatus(paymentId, status, notes);

    res.status(200).json({
      status: 'success',
      message: `Payment status updated to ${status}`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const refundPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentId } = req.params;
    const { amount } = req.body;

    const result = await paymentService.refundPayment(paymentId, amount ? Number(amount) : undefined);

    res.status(200).json({
      status: 'success',
      message: 'Payment refunded successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payments = await paymentService.getAllPayments();
    res.status(200).json({
      status: 'success',
      data: payments,
    });
  } catch (err) {
    next(err);
  }
};
