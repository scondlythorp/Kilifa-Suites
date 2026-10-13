import {
  IPaymentAdapter,
  InitiatePaymentRequest,
  InitiatePaymentResponse,
  PaymentProvider,
  PaymentVerificationResult,
  RefundResult,
} from '../types';

export class CashBankAdapter implements IPaymentAdapter {
  public provider: PaymentProvider;

  constructor(provider: 'CASH' | 'BANK_TRANSFER') {
    this.provider = provider;
  }

  public isConfigured(): boolean {
    return true; // Cash & Bank transfer always supported natively
  }

  public async initiatePayment(req: InitiatePaymentRequest): Promise<InitiatePaymentResponse> {
    const prefix = this.provider === 'CASH' ? 'CASH' : 'BANK';
    const txRef = `${prefix}-${req.bookingReference}-${Date.now().toString().slice(-6)}`;
    const instructions =
      this.provider === 'CASH'
        ? `Cash payment of D ${Number(req.amount).toLocaleString()} due at Kilifa Suites Front Desk upon arrival.`
        : `Bank Wire Transfer created for D ${Number(req.amount).toLocaleString()}. Ecobank Gambia / Trust Bank Gambia. Present bank transfer slip at check-in.`;

    return {
      paymentId: '',
      bookingId: req.bookingId,
      bookingReference: req.bookingReference,
      amount: req.amount,
      paidAmount: 0,
      currency: req.currency || 'GMD',
      provider: this.provider,
      status: 'PENDING',
      transactionRef: txRef,
      instructions,
      requiresCustomerAction: false,
    };
  }

  public async verifyPayment(transactionRef: string): Promise<PaymentVerificationResult> {
    return {
      transactionRef,
      status: 'SUCCESSFUL',
      amount: 0,
      paidAmount: 0,
      currency: 'GMD',
      provider: this.provider,
      gatewayMessage: `${this.provider} transaction verified by Receptionist`,
    };
  }

  public async refund(transactionRef: string, amount?: number): Promise<RefundResult> {
    const refundRef = `REF-${this.provider}-${Date.now().toString().slice(-6)}`;
    return {
      transactionRef,
      refundRef,
      status: 'REFUNDED',
      refundedAmount: amount || 0,
      remainingAmount: 0,
      gatewayMessage: `${this.provider} refund recorded in reception ledger`,
    };
  }
}
