import { NotificationChannel, NotificationPayload, NotificationResult, ProviderStatus } from './types';

export interface INotificationProvider {
  name: string;
  channel: NotificationChannel;
  isConfigured(): boolean;
  getStatus(): ProviderStatus;
  send(payload: NotificationPayload): Promise<NotificationResult>;
}
