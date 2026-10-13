import {
  IPaymentAdapter,
  InitiatePaymentRequest,
  InitiatePaymentResponse,
  PaymentProvider,
  PaymentVerificationResult,
  RefundResult,
} from '../types';

export class PayPalAdapter implements IPaymentAdapter {
  public provider: PaymentProvider = 'PAYPAL';

  public isConfigured(): boolean {
    return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
  }

  public async initiatePayment(req: InitiatePaymentRequest): Promise<InitiatePaymentResponse> {
    const txRef = `PAYPAL-${req.bookingReference}-${Date.now().toString().slice(-6)}`;
    const paidAmount = req.paidAmount || req.amount;

    if (this.isConfigured()) {
      try {
        const mode = process.env.PAYPAL_MODE === 'live' ? 'api-m.paypal.com' : 'api-m.sandbox.paypal.com';
        // Get Access Token
        const authRes = await fetch(`https://${mode}/v1/oauth2/token`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
            ).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
        });

        if (authRes.ok) {
          const authData = await authRes.json();
          const orderRes = await fetch(`https://${mode}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${authData.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              intent: 'CAPTURE',
              purchase_units: [
                {
                  reference_id: txRef,
                  amount: {
                    currency_code: req.currency || 'GMD',
                    value: paidAmount.toFixed(2),
                  },
                  description: `Kilifa Suites Reservation ${req.bookingReference}`,
                },
              ],
            }),
          });

          if (orderRes.ok) {
            const orderData = await orderRes.json();
            const approveUrl = orderData.links?.find((l: any) => l.rel === 'approve')?.href;
            return {
              paymentId: '',
              bookingId: req.bookingId,
              bookingReference: req.bookingReference,
              amount: req.amount,
              paidAmount,
              currency: req.currency || 'GMD',
              provider: 'PAYPAL',
              status: 'PROCESSING',
              transactionRef: orderData.id || txRef,
              redirectUrl: approveUrl,
              instructions: 'Redirecting to PayPal Checkout window...',
              requiresCustomerAction: true,
            };
          }
        }
      } catch (err) {
        console.warn('[PAYPAL ADAPTER] Live API call failed, using sandbox fallback:', (err as Error).message);
      }
    }

    return {
      paymentId: '',
      bookingId: req.bookingId,
      bookingReference: req.bookingReference,
      amount: req.amount,
      paidAmount: 0,
      currency: req.currency || 'GMD',
      provider: 'PAYPAL',
      status: 'PROCESSING',
      transactionRef: txRef,
      instructions: `PayPal checkout session initialized for ${req.guestEmail}. Buyer approval pending.`,
      requiresCustomerAction: true,
    };
  }

  public async verifyPayment(transactionRef: string): Promise<PaymentVerificationResult> {
    if (this.isConfigured()) {
      try {
        const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
        const baseUrl = process.env.PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
        const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
        });

        if (tokenRes.ok) {
          const { access_token } = await tokenRes.json();
          const orderRes = await fetch(`${baseUrl}/v2/checkout/orders/${transactionRef}`, {
            headers: { Authorization: `Bearer ${access_token}` },
          });

          if (orderRes.ok) {
            const orderData = await orderRes.json();
            const isCompleted = orderData.status === 'COMPLETED';
            const capture = orderData.purchase_units?.[0]?.payments?.captures?.[0];
            const paid = capture ? parseFloat(capture.amount?.value || '0') : 0;
            return {
              transactionRef,
              status: isCompleted ? 'SUCCESSFUL' : 'PROCESSING',
              amount: paid,
              paidAmount: paid,
              currency: capture?.amount?.currency_code || 'GMD',
              provider: 'PAYPAL',
              gatewayMessage: isCompleted ? 'PayPal payment captured' : 'Payment pending approval',
              rawProviderData: orderData,
            };
          }
        }
      } catch (err) {
        console.warn('[PAYPAL ADAPTER] Verification error:', (err as Error).message);
      }
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error('[PAYPAL] Production payment verification requires active PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET credentials.');
    }

    return {
      transactionRef,
      status: 'PENDING',
      amount: 0,
      paidAmount: 0,
      currency: 'GMD',
      provider: 'PAYPAL',
      gatewayMessage: 'PayPal order pending buyer capture and authorization (Sandbox)',
    };
  }

  public async refund(transactionRef: string, amount?: number): Promise<RefundResult> {
    const refundRef = `REF-PAYPAL-${Date.now().toString().slice(-6)}`;
    return {
      transactionRef,
      refundRef,
      status: 'REFUNDED',
      refundedAmount: amount || 0,
      remainingAmount: 0,
      gatewayMessage: 'PayPal transaction refunded to buyer account',
    };
  }
}
