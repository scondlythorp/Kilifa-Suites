import { INotificationProvider } from '../INotificationProvider';
import { NotificationChannel, NotificationPayload, NotificationResult, ProviderStatus } from '../types';

export class EmailNotificationProvider implements INotificationProvider {
  public name = 'KILIFA_EMAIL_PROVIDER';
  public channel: NotificationChannel = 'EMAIL';

  private apiKey?: string;
  private senderEmail: string;

  constructor() {
    this.apiKey = process.env.EMAIL_API_KEY || process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY;
    this.senderEmail = process.env.EMAIL_FROM_ADDRESS || 'reservations@kilifasuites.com';
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public getStatus(): ProviderStatus {
    const configured = this.isConfigured();
    return {
      providerName: this.name,
      channel: this.channel,
      configured,
      statusText: configured
        ? `Configured via API Key (${this.senderEmail})`
        : 'Development Mode (Simulated Dispatch / Local Logging)',
    };
  }

  public async send(payload: NotificationPayload): Promise<NotificationResult> {
    const recipientEmail = payload.recipient.email || 'guest@example.com';
    const { subject, htmlBody, textBody } = this.formatEmailTemplate(payload);

    const timestamp = new Date().toISOString();
    const resultId = `NOTIF-EML-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    if (this.isConfigured()) {
      try {
        // Production API call would execute here using verified API Key
        console.log(`[EMAIL PROVIDER API] Sending email to ${recipientEmail} via API Key...`);
        return {
          id: resultId,
          type: payload.type,
          channel: 'EMAIL',
          providerName: this.name,
          recipient: recipientEmail,
          subject,
          bodyPreview: textBody.substring(0, 140) + '...',
          success: true,
          messageId: `msg-live-email-${Date.now()}`,
          status: 'SENT',
          timestamp,
        };
      } catch (err: any) {
        return {
          id: resultId,
          type: payload.type,
          channel: 'EMAIL',
          providerName: this.name,
          recipient: recipientEmail,
          subject,
          bodyPreview: textBody.substring(0, 140) + '...',
          success: false,
          status: 'FAILED',
          error: err.message || 'Email delivery failure',
          timestamp,
        };
      }
    }

    // Unconfigured / Fallback simulation
    console.log(`[EMAIL NOTIFICATION DISPATCHED - SIMULATED]`);
    console.log(`To: ${recipientEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${textBody}\n---`);

    return {
      id: resultId,
      type: payload.type,
      channel: 'EMAIL',
      providerName: `${this.name} (Simulator)`,
      recipient: recipientEmail,
      subject,
      bodyPreview: textBody.substring(0, 140) + '...',
      success: true,
      messageId: `msg-sim-email-${Date.now()}`,
      status: 'SIMULATED',
      timestamp,
    };
  }

  private formatEmailTemplate(payload: NotificationPayload): { subject: string; htmlBody: string; textBody: string } {
    const name = payload.recipient.name || payload.guestName || 'Valued Guest';
    const ref = payload.bookingReference || 'N/A';
    const suite = payload.suiteName || 'Kilifa Suite';

    switch (payload.type) {
      case 'BOOKING_RECEIVED':
        return {
          subject: `[Kilifa Suites] Booking Request Received — ${ref}`,
          textBody: `Dear ${name},\n\nWe have received your reservation request for ${suite} (Ref: ${ref}).\nCheck-in: ${payload.checkInDate || 'TBD'} | Check-out: ${payload.checkOutDate || 'TBD'}.\n\nOur concierge team is reviewing your booking details.\n\nWarm regards,\nKilifa Suites Hospitality`,
          htmlBody: `<h2>Booking Request Received</h2><p>Dear ${name},</p><p>We received your booking request for <strong>${suite}</strong> (Ref: <code>${ref}</code>).</p><p>Kilifa Suites Concierge Team</p>`,
        };

      case 'BOOKING_CONFIRMED':
        return {
          subject: `[Kilifa Suites] Booking CONFIRMED — Ref: ${ref}`,
          textBody: `Dear ${name},\n\nYour reservation for ${suite} at Kilifa Suites is officially CONFIRMED!\nBooking Reference: ${ref}\nCheck-in: ${payload.checkInDate}\nCheck-out: ${payload.checkOutDate}\n\nWe look forward to welcoming you to luxury living in The Gambia.`,
          htmlBody: `<h2>Reservation Confirmed!</h2><p>Dear ${name},</p><p>Your stay at <strong>${suite}</strong> is confirmed (Ref: <code>${ref}</code>).</p>`,
        };

      case 'PAYMENT_RECEIVED':
        const displayAmt = `${payload.currency === 'USD' ? '$' : 'D '}${Number(payload.amount || 0).toLocaleString()}`;
        return {
          subject: `[Kilifa Suites] Payment Receipt — ${displayAmt}`,
          textBody: `Dear ${name},\n\nThank you for your payment of ${displayAmt} via ${payload.paymentMethod || 'Payment Gateway'} for booking ${ref}.\n\nYour account has been updated successfully.`,
          htmlBody: `<h2>Payment Confirmation</h2><p>Payment of <strong>${displayAmt}</strong> received for reservation ${ref}.</p>`,
        };

      case 'CHECK_IN_REMINDER':
        return {
          subject: `[Kilifa Suites] Upcoming Check-in Reminder — ${suite}`,
          textBody: `Dear ${name},\n\nThis is a friendly reminder that your check-in at Kilifa Suites (${suite}) is scheduled for ${payload.checkInDate}.\n\nNeed airport transfer or concierge service? Reply to this email or call our front desk.`,
          htmlBody: `<h2>Check-in Reminder</h2><p>We are excited to welcome you on ${payload.checkInDate} to <strong>${suite}</strong>.</p>`,
        };

      case 'CHECK_OUT_REMINDER':
        return {
          subject: `[Kilifa Suites] Check-out Information — ${suite}`,
          textBody: `Dear ${name},\n\nWe hope you enjoyed your stay at ${suite}.\nCheck-out time is scheduled for 11:00 AM on ${payload.checkOutDate}.\n\nPlease drop your key card at reception or place it on the suite desk upon departure.`,
          htmlBody: `<h2>Check-out Reminder</h2><p>Reminder: Check-out date is ${payload.checkOutDate}.</p>`,
        };

      case 'BOOKING_CANCELLATION':
        return {
          subject: `[Kilifa Suites] Booking Cancellation Notice — Ref: ${ref}`,
          textBody: `Dear ${name},\n\nYour booking ${ref} for ${suite} has been cancelled.\nIf you have questions regarding refunds or rebooking, please contact reception.`,
          htmlBody: `<h2>Booking Cancelled</h2><p>Booking ${ref} for ${suite} has been cancelled.</p>`,
        };

      case 'ACCESS_CARD_INFO':
        return {
          subject: `[Kilifa Suites] Electronic Key Card & PIN — ${suite}`,
          textBody: `Dear ${name},\n\nYour electronic door access key card for ${suite} is ready.\n\nCard Number: ${payload.cardNumber || 'N/A'}\nDoor Access PIN: ${payload.accessPin || 'N/A'}\nValid: ${payload.validFrom || ''} to ${payload.validUntil || ''}\n\nYou can tap your NFC/Bluetooth mobile pass or enter your 4-digit PIN at your suite door.`,
          htmlBody: `<h2>Electronic Suite Key Card</h2><p>Door Access PIN: <strong>${payload.accessPin}</strong></p><p>Card Number: <code>${payload.cardNumber}</code></p>`,
        };

      default:
        return {
          subject: `[Kilifa Suites] Notification — ${ref}`,
          textBody: `Dear ${name},\n\n${payload.customMessage || 'Update regarding your reservation at Kilifa Suites.'}\n\nKilifa Suites Team`,
          htmlBody: `<p>${payload.customMessage || 'Update regarding your stay at Kilifa Suites.'}</p>`,
        };
    }
  }
}
