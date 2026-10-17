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

    // When initiated via API/checkout, cash and bank transfer payments remain PENDING
    // until physical cash or wire confirmation is verified by authorized staff at the front desk.
    const status: any = 'PENDING';
    const instructions =
      this.provider === 'CASH'
        ? `Cash reservation recorded for D ${Number(req.amount).toLocaleString()}. Please settle payment in cash upon check-in at Kilifa Suites Front Desk.`
        : `Bank wire reservation recorded for D ${Number(req.amount).toLocaleString()}. Please transfer to Ecobank / Trust Bank Gambia and present receipt at check-in.`;

    return {
      paymentId: '',
      bookingId: req.bookingId,
      bookingReference: req.bookingReference,
      amount: req.amount,
      paidAmount: 0,
      currency: req.currency || 'GMD',
      provider: this.provider,
      status,
      transactionRef: txRef,
      instructions,
      requiresCustomerAction: true,
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
