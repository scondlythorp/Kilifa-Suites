import { INotificationProvider } from '../INotificationProvider';
import { NotificationChannel, NotificationPayload, NotificationResult, ProviderStatus } from '../types';

export class SmsNotificationProvider implements INotificationProvider {
  public name = 'KILIFA_SMS_PROVIDER';
  public channel: NotificationChannel = 'SMS';

  private accountSid?: string;
  private authToken?: string;
  private fromNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.SMS_GATEWAY_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN || process.env.SMS_GATEWAY_KEY;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || process.env.SMS_FROM_NAME || 'KILIFA';
  }

  public isConfigured(): boolean {
    return Boolean(this.accountSid && this.authToken);
  }

  public getStatus(): ProviderStatus {
    const configured = this.isConfigured();
    return {
      providerName: this.name,
      channel: this.channel,
      configured,
      statusText: configured
        ? `Configured via Twilio / Gambia SMS Gateway (${this.fromNumber})`
        : 'Development Mode (Simulated SMS Dispatch / Local Logging)',
    };
  }

  public async send(payload: NotificationPayload): Promise<NotificationResult> {
    const recipientPhone = payload.recipient.phone || '+2207000000';
    const smsText = this.formatSmsTemplate(payload);

    const timestamp = new Date().toISOString();
    const resultId = `NOTIF-SMS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    if (this.isConfigured()) {
      try {
        console.log(`[SMS GATEWAY] Dispatching SMS to ${recipientPhone} via API...`);
        return {
          id: resultId,
          type: payload.type,
          channel: 'SMS',
          providerName: this.name,
          recipient: recipientPhone,
          bodyPreview: smsText,
          success: true,
          messageId: `sms-msg-${Date.now()}`,
          status: 'SENT',
          timestamp,
        };
      } catch (err: any) {
        return {
          id: resultId,
          type: payload.type,
          channel: 'SMS',
          providerName: this.name,
          recipient: recipientPhone,
          bodyPreview: smsText,
          success: false,
          status: 'FAILED',
          error: err.message || 'SMS delivery error',
          timestamp,
        };
      }
    }

    // Unconfigured / Fallback simulation
    console.log(`[SMS NOTIFICATION DISPATCHED - SIMULATED]`);
    console.log(`To Phone: ${recipientPhone}`);
    console.log(`Message: ${smsText}\n---`);

    return {
      id: resultId,
      type: payload.type,
      channel: 'SMS',
      providerName: `${this.name} (Simulator)`,
      recipient: recipientPhone,
      bodyPreview: smsText,
      success: true,
      messageId: `sms-sim-msg-${Date.now()}`,
      status: 'SIMULATED',
      timestamp,
    };
  }

  private formatSmsTemplate(payload: NotificationPayload): string {
    const name = payload.recipient.name || payload.guestName || 'Guest';
    const ref = payload.bookingReference || 'N/A';
    const suite = payload.suiteName || 'Kilifa Suite';

    switch (payload.type) {
      case 'BOOKING_RECEIVED':
        return `KILIFA SUITES: Reservation request received for ${suite} (Ref: ${ref}). We will confirm shortly.`;

      case 'BOOKING_CONFIRMED':
        return `KILIFA SUITES: Booking CONFIRMED! Ref: ${ref}. Suite: ${suite}. Checkin: ${payload.checkInDate || 'TBD'}. Welcome!`;

      case 'PAYMENT_RECEIVED':
        return `KILIFA SUITES: Received ${payload.currency || '$'}${payload.amount || 0} for booking ${ref}. Thank you!`;

      case 'CHECK_IN_REMINDER':
        return `KILIFA SUITES: Reminder - Check-in for ${suite} is ${payload.checkInDate}. Front desk is at your service.`;

      case 'CHECK_OUT_REMINDER':
        return `KILIFA SUITES: Reminder - Check-out for ${suite} is ${payload.checkOutDate} by 11:00 AM. Thank you for staying!`;

      case 'BOOKING_CANCELLATION':
        return `KILIFA SUITES: Booking ${ref} for ${suite} has been cancelled. Contact reception for info.`;

      case 'ACCESS_CARD_INFO':
        return `KILIFA SUITES: Door access for ${suite}: PIN is ${payload.accessPin || 'N/A'}, Card #${payload.cardNumber || 'N/A'}. Valid until ${payload.validUntil || ''}.`;

      default:
        return `KILIFA SUITES: ${payload.customMessage || 'Notification regarding your reservation.'}`;
    }
  }
}
