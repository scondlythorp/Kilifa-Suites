export type PaymentProvider =
  | 'WAVE'
  | 'AFRIMONEY'
  | 'APS_WALLET'
  | 'VISA_CARD'
  | 'PAYPAL'
  | 'CASH'
  | 'BANK_TRANSFER';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESSFUL'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'PARTIALLY_PAID'
  | 'COMPLETED';

export interface InitiatePaymentRequest {
  bookingId: string;
  bookingReference: string;
  amount: number;
  paidAmount?: number;
  currency?: string; // default GMD
  provider: PaymentProvider;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  mobileWalletNumber?: string; // For Wave/Afrimoney/APS
  cardToken?: string; // Never raw card/CVV!
  notes?: string;
  metadata?: Record<string, any>;
}

export interface InitiatePaymentResponse {
  paymentId: string;
  bookingId: string;
  bookingReference: string;
  amount: number;
  paidAmount: number;
  currency: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  transactionRef: string;
  redirectUrl?: string;
  instructions?: string;
  qrCodeData?: string;
  requiresCustomerAction: boolean;
  metadata?: Record<string, any>;
}

export interface PaymentVerificationResult {
  transactionRef: string;
  status: PaymentStatus;
  amount: number;
  paidAmount: number;
  currency: string;
  provider: PaymentProvider;
  gatewayMessage?: string;
  rawProviderData?: any;
}

export interface RefundResult {
  transactionRef: string;
  refundRef: string;
  status: PaymentStatus;
  refundedAmount: number;
  remainingAmount: number;
  gatewayMessage?: string;
}

export interface PartialPaymentResult {
  paymentId: string;
  bookingId: string;
  totalAmount: number;
  newPaidAmount: number;
  remainingAmount: number;
  status: PaymentStatus;
}

export interface WebhookVerificationResult {
  verified: boolean;
  transactionRef: string;
  status: PaymentStatus;
  amount?: number;
  paidAmount?: number;
  currency?: string;
  gatewayMessage?: string;
}

export interface IPaymentAdapter {
  provider: PaymentProvider;
  isConfigured(): boolean;
  initiatePayment(req: InitiatePaymentRequest): Promise<InitiatePaymentResponse>;
  verifyPayment(transactionRef: string): Promise<PaymentVerificationResult>;
  refund(transactionRef: string, amount?: number): Promise<RefundResult>;
  verifyWebhook?(payload: any, signatureHeader?: string): Promise<WebhookVerificationResult>;
}
