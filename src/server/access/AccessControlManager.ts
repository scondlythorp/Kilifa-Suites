import { IAccessControlAdapter } from './IAccessControlAdapter';
import { SaltoDormakabaAdapter } from './adapters/SaltoDormakabaAdapter';
import {
  LockHardwareSpec,
  AccessCardCredentials,
  AccessDoorLog,
  CreateCardRequest,
  SimulateEntryRequest,
} from './types';

export class AccessControlManager {
  private activeAdapter: IAccessControlAdapter;

  constructor() {
    this.activeAdapter = new SaltoDormakabaAdapter();
  }

  public setAdapter(adapter: IAccessControlAdapter) {
    this.activeAdapter = adapter;
  }

  public getHardwareSpec(): LockHardwareSpec {
    return this.activeAdapter.getHardwareSpec();
  }

  /**
   * Lifecycle Step 1 & 2: Booking confirmed -> Access card created
   */
  public async handleBookingConfirmed(req: CreateCardRequest): Promise<AccessCardCredentials> {
    const card = await this.activeAdapter.createCard(req);
    return card;
  }

  /**
   * Lifecycle Step 3: Card activated
   */
  public async activateAccessCard(cardId: string): Promise<AccessCardCredentials> {
    return this.activeAdapter.activateCard(cardId);
  }

  /**
   * Lifecycle Step 4: Guest checks in
   */
  public async handleGuestCheckIn(cardId: string): Promise<{ card: AccessCardCredentials; doorLog: AccessDoorLog }> {
    return this.activeAdapter.processCheckIn(cardId);
  }

  /**
   * Lifecycle Step 5: Card remains active / Door Access Tap simulation
   */
  public async simulateDoorEntry(req: SimulateEntryRequest): Promise<AccessDoorLog> {
    return this.activeAdapter.simulateDoorAccess(req);
  }

  /**
   * Lifecycle Step 6 & 7: Checkout -> Card expires
   */
  public async handleGuestCheckOut(cardId: string): Promise<{ card: AccessCardCredentials; doorLog: AccessDoorLog }> {
    return this.activeAdapter.processCheckOut(cardId);
  }

  /**
   * Manual or Scheduled Card Expiration / Revocation
   */
  public async expireCard(cardId: string): Promise<AccessCardCredentials> {
    return this.activeAdapter.expireCard(cardId);
  }

  public async revokeCard(cardId: string, reason?: string): Promise<AccessCardCredentials> {
    return this.activeAdapter.revokeCard(cardId, reason);
  }

  public async getCardDetails(cardId: string): Promise<AccessCardCredentials | null> {
    return this.activeAdapter.getCardDetails(cardId);
  }

  public async getDoorAuditLogs(cardId?: string): Promise<AccessDoorLog[]> {
    return this.activeAdapter.getDoorAuditLogs(cardId);
  }
}

export const accessControlManager = new AccessControlManager();
