export type NotificationType =
  | 'BOOKING_RECEIVED'
  | 'BOOKING_CONFIRMED'
  | 'PAYMENT_RECEIVED'
  | 'CHECK_IN_REMINDER'
  | 'CHECK_OUT_REMINDER'
  | 'BOOKING_CANCELLATION'
  | 'ACCESS_CARD_INFO'
  | 'PASSWORD_RESET';

export type NotificationChannel = 'EMAIL' | 'WHATSAPP' | 'SMS';

export interface NotificationRecipient {
  email?: string;
  phone?: string;
  name?: string;
}

export interface NotificationPayload {
  type: NotificationType;
  recipient: NotificationRecipient;
  bookingReference?: string;
  suiteName?: string;
  guestName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  accessPin?: string;
  cardNumber?: string;
  validFrom?: string;
  validUntil?: string;
  customMessage?: string;
  metadata?: Record<string, any>;
}

export interface NotificationResult {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  providerName: string;
  recipient: string;
  subject?: string;
  bodyPreview: string;
  success: boolean;
  messageId?: string;
  status: 'SENT' | 'SIMULATED' | 'FAILED';
  error?: string;
  timestamp: string;
}

export interface ProviderStatus {
  providerName: string;
  channel: NotificationChannel;
  configured: boolean;
  statusText: string;
}
