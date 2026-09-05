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
    const paidAmount = req.paidAmount !== undefined ? req.paidAmount : req.amount;

    let status: any = 'SUCCESSFUL';
    if (paidAmount <= 0) {
      status = 'PENDING';
    } else if (paidAmount < req.amount) {
      status = 'PARTIALLY_PAID';
    }

    const instructions =
      this.provider === 'CASH'
        ? `Cash payment of $${paidAmount} received at Kilifa Suites Front Desk.`
        : `Bank Wire Transfer record created for $${paidAmount}. Standard Chartered Bank Gambia / Ecobank.`;

    return {
      paymentId: '',
      bookingId: req.bookingId,
      bookingReference: req.bookingReference,
      amount: req.amount,
      paidAmount,
      currency: req.currency || 'USD',
      provider: this.provider,
      status,
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
      currency: 'USD',
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
