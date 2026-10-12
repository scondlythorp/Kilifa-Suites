import {
  IPaymentAdapter,
  InitiatePaymentRequest,
  InitiatePaymentResponse,
  PaymentProvider,
  PaymentVerificationResult,
  RefundResult,
} from './types';
import { WaveAdapter } from './adapters/WaveAdapter';
import { AfrimoneyAdapter } from './adapters/AfrimoneyAdapter';
import { ApsWalletAdapter } from './adapters/ApsWalletAdapter';
import { VisaCardAdapter } from './adapters/VisaCardAdapter';
import { PayPalAdapter } from './adapters/PayPalAdapter';
import { CashBankAdapter } from './adapters/CashBankAdapter';

export class PaymentManager {
  private adapters: Map<PaymentProvider, IPaymentAdapter> = new Map();

  constructor() {
    this.registerAdapter(new WaveAdapter());
    this.registerAdapter(new AfrimoneyAdapter());
    this.registerAdapter(new ApsWalletAdapter());
    this.registerAdapter(new VisaCardAdapter());
    this.registerAdapter(new PayPalAdapter());
    this.registerAdapter(new CashBankAdapter('CASH'));
    this.registerAdapter(new CashBankAdapter('BANK_TRANSFER'));
  }

  public registerAdapter(adapter: IPaymentAdapter): void {
    this.adapters.set(adapter.provider, adapter);
  }

  public getAdapter(provider: PaymentProvider): IPaymentAdapter {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new Error(`Unsupported or unregistered payment provider: ${provider}`);
    }
    return adapter;
  }

  public listProviders(): Array<{
    provider: PaymentProvider;
    name: string;
    isConfigured: boolean;
    type: 'MOBILE_MONEY' | 'CARD' | 'WALLET' | 'DIRECT';
    currency: string;
  }> {
    return [
      {
        provider: 'WAVE',
        name: 'Wave Mobile Money',
        isConfigured: this.getAdapter('WAVE').isConfigured(),
        type: 'MOBILE_MONEY',
        currency: 'GMD',
      },
      {
        provider: 'AFRIMONEY',
        name: 'Afrimoney (The Gambia)',
        isConfigured: this.getAdapter('AFRIMONEY').isConfigured(),
        type: 'MOBILE_MONEY',
        currency: 'GMD',
      },
      {
        provider: 'APS_WALLET',
        name: 'APS Wallet (Gambia)',
        isConfigured: this.getAdapter('APS_WALLET').isConfigured(),
        type: 'WALLET',
        currency: 'GMD',
      },
      {
        provider: 'VISA_CARD',
        name: 'Visa / Mastercard (Credit & Debit)',
        isConfigured: this.getAdapter('VISA_CARD').isConfigured(),
        type: 'CARD',
        currency: 'GMD / Multi-Currency',
      },
      {
        provider: 'PAYPAL',
        name: 'PayPal Global',
        isConfigured: this.getAdapter('PAYPAL').isConfigured(),
        type: 'WALLET',
        currency: 'GMD / Multi-Currency',
      },
      {
        provider: 'CASH',
        name: 'Cash at Reception Desk',
        isConfigured: true,
        type: 'DIRECT',
        currency: 'GMD',
      },
      {
        provider: 'BANK_TRANSFER',
        name: 'Direct Bank Wire Transfer',
        isConfigured: true,
        type: 'DIRECT',
        currency: 'GMD',
      },
    ];
  }

  public async processPayment(req: InitiatePaymentRequest): Promise<InitiatePaymentResponse> {
    const adapter = this.getAdapter(req.provider);
    return adapter.initiatePayment(req);
  }

  public async verifyPayment(provider: PaymentProvider, transactionRef: string): Promise<PaymentVerificationResult> {
    const adapter = this.getAdapter(provider);
    return adapter.verifyPayment(transactionRef);
  }

  public async refundPayment(provider: PaymentProvider, transactionRef: string, amount?: number): Promise<RefundResult> {
    const adapter = this.getAdapter(provider);
    return adapter.refund(transactionRef, amount);
  }
}

export const paymentManager = new PaymentManager();
