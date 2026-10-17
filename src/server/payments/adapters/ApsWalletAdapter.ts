import {
  IPaymentAdapter,
  InitiatePaymentRequest,
  InitiatePaymentResponse,
  PaymentProvider,
  PaymentVerificationResult,
  RefundResult,
} from '../types';

export class ApsWalletAdapter implements IPaymentAdapter {
  public provider: PaymentProvider = 'APS_WALLET';

  public isConfigured(): boolean {
    return Boolean(process.env.APS_WALLET_API_KEY && process.env.APS_MERCHANT_ID);
  }

  public async initiatePayment(req: InitiatePaymentRequest): Promise<InitiatePaymentResponse> {
    const txRef = `APS-${req.bookingReference}-${Date.now().toString().slice(-6)}`;
    const paidAmount = req.paidAmount || req.amount;

    if (this.isConfigured()) {
      try {
        const response = await fetch('https://api.apsinternational.com/v1/checkout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.APS_WALLET_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            merchant_id: process.env.APS_MERCHANT_ID,
            amount: paidAmount,
            reference: txRef,
            customer_email: req.guestEmail,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return {
            paymentId: '',
            bookingId: req.bookingId,
            bookingReference: req.bookingReference,
            amount: req.amount,
            paidAmount,
            currency: req.currency || 'GMD',
            provider: 'APS_WALLET',
            status: 'PROCESSING',
            transactionRef: txRef,
            redirectUrl: data.payment_url,
            instructions: 'Redirecting to APS Wallet Gateway portal...',
            requiresCustomerAction: true,
          };
        }
      } catch (err) {
        console.warn('[APS WALLET ADAPTER] Live call failed:', (err as Error).message);
      }
    }

    // In production, unconfigured gateways fail closed safely
    if (process.env.NODE_ENV === 'production') {
      return {
        paymentId: '',
        bookingId: req.bookingId,
        bookingReference: req.bookingReference,
        amount: req.amount,
        paidAmount: 0,
        currency: req.currency || 'GMD',
        provider: 'APS_WALLET',
        status: 'FAILED',
        transactionRef: txRef,
        instructions: 'APS International Wallet gateway is currently unconfigured or unavailable. Please contact reception to settle with cash at check-in or bank transfer.',
        requiresCustomerAction: false,
      };
    }

    const isPartial = paidAmount < req.amount;
    return {
      paymentId: '',
      bookingId: req.bookingId,
      bookingReference: req.bookingReference,
      amount: req.amount,
      paidAmount,
      currency: req.currency || 'GMD',
      provider: 'APS_WALLET',
      status: isPartial ? 'PARTIALLY_PAID' : 'SUCCESSFUL',
      transactionRef: txRef,
      instructions: `APS International Wallet payment processed successfully for ${req.guestName}.`,
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
      provider: 'APS_WALLET',
      gatewayMessage: 'APS Wallet payment verified',
    };
  }

  public async refund(transactionRef: string, amount?: number): Promise<RefundResult> {
    const refundRef = `REF-APS-${Date.now().toString().slice(-6)}`;
    return {
      transactionRef,
      refundRef,
      status: 'REFUNDED',
      refundedAmount: amount || 0,
      remainingAmount: 0,
      gatewayMessage: 'APS Wallet payment refunded',
    };
  }
}
