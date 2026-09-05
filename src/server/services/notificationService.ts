import { notificationManager } from '../notifications/NotificationManager';
import { NotificationChannel, NotificationPayload, NotificationResult, NotificationType } from '../notifications/types';
import { prisma } from '../db/prisma';

export class NotificationService {
  /**
   * Get health status of all notification provider abstractions
   */
  public getProvidersStatus() {
    return notificationManager.getProvidersStatus();
  }

  /**
   * Get audit logs of all sent/simulated dispatches
   */
  public getAuditHistory(limit?: number) {
    return notificationManager.getAuditHistory(limit);
  }

  /**
   * Generic Dispatch Trigger
   */
  public async sendNotification(payload: NotificationPayload, channels?: NotificationChannel[]) {
    const results = await notificationManager.dispatch(payload, channels);

    // Save in Prisma Notification log table if user account is found by email
    try {
      if (payload.recipient.email) {
        const user = await prisma.user.findUnique({ where: { email: payload.recipient.email } });
        if (user) {
          const bodyText = results[0]?.bodyPreview || `Notification sent for ${payload.type}`;
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: `[Kilifa Suites] ${payload.type}`,
              message: bodyText,
            },
          });
        }
      }
    } catch (err) {
      console.warn('[NOTIFICATION SERVICE] Prisma user notification sync warning:', (err as Error).message);
    }

    return results;
  }

  /**
   * 1. Booking Received Notification
   */
  public async notifyBookingReceived(booking: {
    email: string;
    phone: string;
    fullName: string;
    bookingReference: string;
    suiteName: string;
    checkIn?: string;
    checkOut?: string;
  }, channels?: NotificationChannel[]) {
    return this.sendNotification(
      {
        type: 'BOOKING_RECEIVED',
        recipient: { email: booking.email, phone: booking.phone, name: booking.fullName },
        bookingReference: booking.bookingReference,
        suiteName: booking.suiteName,
        guestName: booking.fullName,
        checkInDate: booking.checkIn,
        checkOutDate: booking.checkOut,
      },
      channels
    );
  }

  /**
   * 2. Booking Confirmed Notification
   */
  public async notifyBookingConfirmed(booking: {
    email: string;
    phone: string;
    fullName: string;
    bookingReference: string;
    suiteName: string;
    checkIn?: string;
    checkOut?: string;
  }, channels?: NotificationChannel[]) {
    return this.sendNotification(
      {
        type: 'BOOKING_CONFIRMED',
        recipient: { email: booking.email, phone: booking.phone, name: booking.fullName },
        bookingReference: booking.bookingReference,
        suiteName: booking.suiteName,
        guestName: booking.fullName,
        checkInDate: booking.checkIn,
        checkOutDate: booking.checkOut,
      },
      channels
    );
  }

  /**
   * 3. Payment Received Notification
   */
  public async notifyPaymentReceived(payment: {
    email: string;
    phone: string;
    fullName: string;
    bookingReference: string;
    amount: number;
    currency?: string;
    paymentMethod?: string;
  }, channels?: NotificationChannel[]) {
    return this.sendNotification(
      {
        type: 'PAYMENT_RECEIVED',
        recipient: { email: payment.email, phone: payment.phone, name: payment.fullName },
        bookingReference: payment.bookingReference,
        guestName: payment.fullName,
        amount: payment.amount,
        currency: payment.currency || '$',
        paymentMethod: payment.paymentMethod || 'Wave / Mobile Money',
      },
      channels
    );
  }

  /**
   * 4. Check-in Reminder Notification
   */
  public async notifyCheckInReminder(booking: {
    email: string;
    phone: string;
    fullName: string;
    bookingReference: string;
    suiteName: string;
    checkIn: string;
  }, channels?: NotificationChannel[]) {
    return this.sendNotification(
      {
        type: 'CHECK_IN_REMINDER',
        recipient: { email: booking.email, phone: booking.phone, name: booking.fullName },
        bookingReference: booking.bookingReference,
        suiteName: booking.suiteName,
        guestName: booking.fullName,
        checkInDate: booking.checkIn,
      },
      channels
    );
  }

  /**
   * 5. Check-out Reminder Notification
   */
  public async notifyCheckOutReminder(booking: {
    email: string;
    phone: string;
    fullName: string;
    bookingReference: string;
    suiteName: string;
    checkOut: string;
  }, channels?: NotificationChannel[]) {
    return this.sendNotification(
      {
        type: 'CHECK_OUT_REMINDER',
        recipient: { email: booking.email, phone: booking.phone, name: booking.fullName },
        bookingReference: booking.bookingReference,
        suiteName: booking.suiteName,
        guestName: booking.fullName,
        checkOutDate: booking.checkOut,
      },
      channels
    );
  }

  /**
   * 6. Booking Cancellation Notification
   */
  public async notifyBookingCancellation(booking: {
    email: string;
    phone: string;
    fullName: string;
    bookingReference: string;
    suiteName: string;
  }, channels?: NotificationChannel[]) {
    return this.sendNotification(
      {
        type: 'BOOKING_CANCELLATION',
        recipient: { email: booking.email, phone: booking.phone, name: booking.fullName },
        bookingReference: booking.bookingReference,
        suiteName: booking.suiteName,
        guestName: booking.fullName,
      },
      channels
    );
  }

  /**
   * 7. Access Card Info Notification
   */
  public async notifyAccessCardInfo(card: {
    email: string;
    phone: string;
    fullName: string;
    bookingReference: string;
    suiteName: string;
    cardNumber: string;
    pinCode: string;
    validFrom?: string;
    validUntil?: string;
  }, channels?: NotificationChannel[]) {
    return this.sendNotification(
      {
        type: 'ACCESS_CARD_INFO',
        recipient: { email: card.email, phone: card.phone, name: card.fullName },
        bookingReference: card.bookingReference,
        suiteName: card.suiteName,
        guestName: card.fullName,
        cardNumber: card.cardNumber,
        accessPin: card.pinCode,
        validFrom: card.validFrom,
        validUntil: card.validUntil,
      },
      channels
    );
  }
}

export const notificationService = new NotificationService();
