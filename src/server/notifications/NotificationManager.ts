import { INotificationProvider } from './INotificationProvider';
import { EmailNotificationProvider } from './providers/EmailNotificationProvider';
import { WhatsAppNotificationProvider } from './providers/WhatsAppNotificationProvider';
import { SmsNotificationProvider } from './providers/SmsNotificationProvider';
import {
  NotificationChannel,
  NotificationPayload,
  NotificationResult,
  ProviderStatus,
} from './types';

export class NotificationManager {
  private providers: Map<NotificationChannel, INotificationProvider> = new Map();
  private auditHistory: NotificationResult[] = [];

  constructor() {
    // Register default multi-channel providers
    this.registerProvider(new EmailNotificationProvider());
    this.registerProvider(new WhatsAppNotificationProvider());
    this.registerProvider(new SmsNotificationProvider());

    this.seedDemoHistory();
  }

  /**
   * Register or replace a channel provider abstraction dynamically
   */
  public registerProvider(provider: INotificationProvider) {
    this.providers.set(provider.channel, provider);
    console.log(`[NOTIFICATION MANAGER] Registered provider '${provider.name}' for channel '${provider.channel}'`);
  }

  public getProvider(channel: NotificationChannel): INotificationProvider | undefined {
    return this.providers.get(channel);
  }

  public getProvidersStatus(): ProviderStatus[] {
    const statuses: ProviderStatus[] = [];
    for (const provider of this.providers.values()) {
      statuses.push(provider.getStatus());
    }
    return statuses;
  }

  /**
   * Dispatch notification across specified channels or default to Email + WhatsApp
   */
  public async dispatch(
    payload: NotificationPayload,
    channels: NotificationChannel[] = ['EMAIL', 'WHATSAPP']
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    for (const channel of channels) {
      const provider = this.providers.get(channel);
      if (!provider) {
        const errorResult: NotificationResult = {
          id: `NOTIF-ERR-${Date.now()}`,
          type: payload.type,
          channel,
          providerName: 'NONE',
          recipient: payload.recipient.email || payload.recipient.phone || 'Unknown',
          bodyPreview: 'No provider registered for this channel',
          success: false,
          status: 'FAILED',
          error: `No notification provider registered for channel ${channel}`,
          timestamp: new Date().toISOString(),
        };
        results.push(errorResult);
        this.addAuditLog(errorResult);
        continue;
      }

      try {
        const result = await provider.send(payload);
        results.push(result);
        this.addAuditLog(result);
      } catch (err: any) {
        const failedResult: NotificationResult = {
          id: `NOTIF-ERR-${Date.now()}`,
          type: payload.type,
          channel,
          providerName: provider.name,
          recipient: payload.recipient.email || payload.recipient.phone || 'Unknown',
          bodyPreview: 'Dispatch exception',
          success: false,
          status: 'FAILED',
          error: err.message || 'Notification sending threw exception',
          timestamp: new Date().toISOString(),
        };
        results.push(failedResult);
        this.addAuditLog(failedResult);
      }
    }

    return results;
  }

  public getAuditHistory(limit: number = 50): NotificationResult[] {
    return this.auditHistory.slice(0, limit);
  }

  private addAuditLog(result: NotificationResult) {
    this.auditHistory.unshift(result);
    if (this.auditHistory.length > 200) {
      this.auditHistory.pop();
    }
  }

  private seedDemoHistory() {
    const now = new Date();
    this.auditHistory = [
      {
        id: 'NOTIF-EML-DEMO-101',
        type: 'ACCESS_CARD_INFO',
        channel: 'EMAIL',
        providerName: 'KILIFA_EMAIL_PROVIDER (Simulator)',
        recipient: 'fatou.ceesay@example.com',
        subject: '[Kilifa Suites] Electronic Key Card & PIN — Ambassador Executive Suite 2',
        bodyPreview: 'Dear Fatou Ceesay, Your electronic door access key card for Ambassador Executive Suite 2 is ready...',
        success: true,
        messageId: 'msg-sim-email-demo-101',
        status: 'SIMULATED',
        timestamp: new Date(now.getTime() - 3600000 * 2).toISOString(),
      },
      {
        id: 'NOTIF-WA-DEMO-102',
        type: 'BOOKING_CONFIRMED',
        channel: 'WHATSAPP',
        providerName: 'KILIFA_WHATSAPP_PROVIDER (Simulator)',
        recipient: '+2207001020',
        bodyPreview: '✅ Booking Confirmed — Kilifa Suites. Hello Fatou Ceesay, Your stay at Ambassador Executive Suite 2 is confirmed...',
        success: true,
        messageId: 'wa-sim-msg-demo-102',
        status: 'SIMULATED',
        timestamp: new Date(now.getTime() - 3600000 * 5).toISOString(),
      },
      {
        id: 'NOTIF-SMS-DEMO-103',
        type: 'PAYMENT_RECEIVED',
        channel: 'SMS',
        providerName: 'KILIFA_SMS_PROVIDER (Simulator)',
        recipient: '+2207001020',
        bodyPreview: 'KILIFA SUITES: Received $700.00 for booking KS-910234. Thank you!',
        success: true,
        messageId: 'sms-sim-msg-demo-103',
        status: 'SIMULATED',
        timestamp: new Date(now.getTime() - 3600000 * 6).toISOString(),
      },
    ];
  }
}

export const notificationManager = new NotificationManager();
