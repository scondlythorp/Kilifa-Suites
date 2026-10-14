import { prisma } from '../db/prisma';
import { ApiError } from '../middleware/errorHandler';
import { paymentManager } from '../payments/PaymentManager';
import {
  InitiatePaymentRequest,
  InitiatePaymentResponse,
  PaymentProvider,
  PaymentStatus,
  PaymentVerificationResult,
  RefundResult,
} from '../payments/types';
import { notificationService } from './notificationService';

export class PaymentService {
  public getAvailableProviders() {
    return paymentManager.listProviders();
  }

  public async initiatePayment(req: InitiatePaymentRequest): Promise<InitiatePaymentResponse> {
    // 1. Verify Booking exists
    let booking: any = null;
    try {
      booking = await prisma.booking.findFirst({
        where: { OR: [{ id: req.bookingId }, { bookingReference: req.bookingReference }] },
        include: { payment: true, suite: true },
      });
    } catch (err) {
      console.warn('[PAYMENT SERVICE] Prisma booking lookup warning:', (err as Error).message);
    }

    const totalAmount = booking ? booking.totalEstimatedPrice : req.amount;
    const initialPaid = req.paidAmount !== undefined ? req.paidAmount : totalAmount;

    // 2. Delegate to Payment Manager Abstraction Layer
    const gatewayResult = await paymentManager.processPayment({
      ...req,
      bookingId: booking ? booking.id : req.bookingId,
      bookingReference: booking ? booking.bookingReference : req.bookingReference,
      amount: totalAmount,
      paidAmount: initialPaid,
    });

    // Map provider string to Prisma PaymentMethod enum
    const methodEnum = this.mapProviderToEnum(req.provider);
    const statusEnum = this.mapStatusToEnum(gatewayResult.status);

    // 3. Persist / Update Payment Record in PostgreSQL Database
    try {
      if (booking) {
        const existingPayment = booking.payment;
        if (existingPayment) {
          const updatedPayment = await prisma.payment.update({
            where: { id: existingPayment.id },
            data: {
              amount: totalAmount,
              paidAmount: initialPaid,
              status: statusEnum as any,
              method: methodEnum as any,
              provider: req.provider,
              transactionRef: gatewayResult.transactionRef,
              paymentNotes: gatewayResult.instructions,
            },
          });
          gatewayResult.paymentId = updatedPayment.id;
        } else {
          const newPayment = await prisma.payment.create({
            data: {
              bookingId: booking.id,
              amount: totalAmount,
              paidAmount: initialPaid,
              currency: req.currency || 'GMD',
              status: statusEnum as any,
              method: methodEnum as any,
              provider: req.provider,
              transactionRef: gatewayResult.transactionRef,
              paymentNotes: gatewayResult.instructions,
            },
          });
          gatewayResult.paymentId = newPayment.id;
        }

        // If payment is SUCCESSFUL or PARTIALLY_PAID, update booking status to CONFIRMED & dispatch notification
        if (gatewayResult.status === 'SUCCESSFUL' || gatewayResult.status === 'PARTIALLY_PAID') {
          await prisma.booking.update({
            where: { id: booking.id },
            data: { status: 'CONFIRMED' },
          });

          notificationService.notifyPaymentReceived({
            email: booking.email,
            phone: booking.phone,
            fullName: booking.fullName,
            bookingReference: booking.bookingReference,
            amount: initialPaid,
            currency: req.currency || 'GMD',
            paymentMethod: req.provider,
          }).catch((err) => console.warn('[PAYMENT NOTIFICATION ERROR]', err));
        }
      }
    } catch (err) {
      console.warn('[PAYMENT SERVICE] Prisma payment persistence warning:', (err as Error).message);
    }

    if (!gatewayResult.paymentId) {
      gatewayResult.paymentId = `PAY-${Date.now().toString().slice(-8)}`;
    }

    return gatewayResult;
  }

  public async recordPartialPayment(
    paymentId: string,
    paidAmount: number,
    notes?: string
  ) {
    let payment: any = null;
    try {
      payment = await prisma.payment.findFirst({
        where: { OR: [{ id: paymentId }, { bookingId: paymentId }, { transactionRef: paymentId }] },
        include: { booking: true },
      });

      if (payment) {
        const cumulativePaid = payment.paidAmount + paidAmount;
        const total = payment.amount;
        const newStatus: PaymentStatus =
          cumulativePaid >= total ? 'SUCCESSFUL' : cumulativePaid > 0 ? 'PARTIALLY_PAID' : 'PENDING';

        const updated = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            paidAmount: cumulativePaid,
            status: this.mapStatusToEnum(newStatus) as any,
            paymentNotes: notes ? `${payment.paymentNotes || ''} | ${notes}` : payment.paymentNotes,
          },
          include: { booking: { include: { suite: true } } },
        });

        if (newStatus === 'SUCCESSFUL' || newStatus === 'PARTIALLY_PAID') {
          await prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: 'CONFIRMED' },
          });
        }

        return {
          paymentId: updated.id,
          bookingId: updated.bookingId,
          bookingReference: updated.booking.bookingReference,
          totalAmount: updated.amount,
          paidAmount: updated.paidAmount,
          remainingAmount: Math.max(0, updated.amount - updated.paidAmount),
          status: newStatus,
          provider: updated.provider,
        };
      }
    } catch (err) {
      console.warn('[PAYMENT SERVICE] Prisma recordPartialPayment failed:', (err as Error).message);
    }

    throw new ApiError(404, `Payment record '${paymentId}' not found`);
  }

  public async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    notes?: string
  ) {
    const statusEnum = this.mapStatusToEnum(status);

    try {
      const payment = await prisma.payment.findFirst({
        where: { OR: [{ id: paymentId }, { bookingId: paymentId }, { transactionRef: paymentId }] },
      });

      if (payment) {
        const updated = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: statusEnum as any,
            ...(status === 'SUCCESSFUL' && { paidAmount: payment.amount }),
            ...(notes && { paymentNotes: notes }),
          },
          include: { booking: { include: { suite: true } } },
        });

        if (status === 'SUCCESSFUL' || status === 'PARTIALLY_PAID') {
          await prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: 'CONFIRMED' },
          });
        } else if (status === 'CANCELLED' || status === 'FAILED') {
          await prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: 'CANCELLED' },
          });
        }

        return updated;
      }
    } catch (err) {
      console.warn('[PAYMENT SERVICE] Prisma status update failed:', (err as Error).message);
    }

    throw new ApiError(404, `Payment '${paymentId}' not found`);
  }

  public async refundPayment(paymentId: string, amount?: number): Promise<RefundResult> {
    try {
      const payment = await prisma.payment.findFirst({
        where: { OR: [{ id: paymentId }, { bookingId: paymentId }, { transactionRef: paymentId }] },
      });

      if (payment) {
        const refundAmount = amount || payment.paidAmount || payment.amount;
        const provider = (payment.provider || 'CASH') as PaymentProvider;

        const gatewayRefund = await paymentManager.refundPayment(
          provider,
          payment.transactionRef || payment.id,
          refundAmount
        );

        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'REFUNDED' as any,
            paidAmount: Math.max(0, payment.paidAmount - refundAmount),
            paymentNotes: `Refunded $${refundAmount} via ${provider}. Ref: ${gatewayRefund.refundRef}`,
          },
        });

        return gatewayRefund;
      }
    } catch (err) {
      console.warn('[PAYMENT SERVICE] Prisma refund failed:', (err as Error).message);
    }

    throw new ApiError(404, `Payment record '${paymentId}' not found for refund`);
  }

  public async getAllPayments() {
    try {
      const payments = await prisma.payment.findMany({
        include: {
          booking: {
            include: { suite: true, guest: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (payments && payments.length > 0) {
        return payments.map((p) => ({
          id: p.id,
          bookingId: p.bookingId,
          bookingReference: p.booking?.bookingReference || 'N/A',
          guestName: p.booking?.fullName || 'Guest',
          guestEmail: p.booking?.email || 'N/A',
          suiteName: p.booking?.suite?.name || 'DAR',
          amount: p.amount,
          paidAmount: p.paidAmount,
          currency: p.currency,
          status: p.status,
          method: p.method,
          provider: p.provider,
          transactionRef: p.transactionRef,
          notes: p.paymentNotes,
          createdAt: p.createdAt.toISOString(),
        }));
      }
    } catch (err) {
      console.warn('[PAYMENT SERVICE] Prisma getAllPayments failed:', (err as Error).message);
    }

    return [];
  }

  private mapProviderToEnum(provider: PaymentProvider): string {
    switch (provider) {
      case 'WAVE':
        return 'WAVE';
      case 'AFRIMONEY':
        return 'AFRIMONEY';
      case 'APS_WALLET':
        return 'APS_WALLET';
      case 'VISA_CARD':
        return 'VISA_CARD';
      case 'PAYPAL':
        return 'PAYPAL';
      case 'BANK_TRANSFER':
        return 'BANK_TRANSFER';
      case 'CASH':
      default:
        return 'CASH';
    }
  }

  private mapStatusToEnum(status: PaymentStatus): string {
    switch (status) {
      case 'PROCESSING':
        return 'PROCESSING';
      case 'SUCCESSFUL':
      case 'COMPLETED':
        return 'SUCCESSFUL';
      case 'FAILED':
        return 'FAILED';
      case 'CANCELLED':
        return 'CANCELLED';
      case 'REFUNDED':
        return 'REFUNDED';
      case 'PARTIALLY_PAID':
        return 'PARTIALLY_PAID';
      case 'PENDING':
      default:
        return 'PENDING';
    }
  }
}

export const paymentService = new PaymentService();
