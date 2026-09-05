import { IAccessControlAdapter } from '../IAccessControlAdapter';
import {
  LockHardwareSpec,
  AccessCardCredentials,
  AccessDoorLog,
  CreateCardRequest,
  SimulateEntryRequest,
} from '../types';

export class SaltoDormakabaAdapter implements IAccessControlAdapter {
  public providerName = 'SALTO_DORMAKABA_SPACE';

  private cardsMap: Map<string, AccessCardCredentials> = new Map();
  private doorLogsList: AccessDoorLog[] = [];

  constructor() {
    this.seedDemoData();
  }

  public getHardwareSpec(): LockHardwareSpec {
    return {
      lockManufacturer: 'SALTO Systems / Dormakaba Integration',
      hardwareModel: 'XS4 Original RFID Escutcheon & Mobile Key Gate Controller',
      cardTechnology: 'RFID MIFARE DESFire EV2 (13.56 MHz, 4K High Security) + NFC / BLE',
      accessControlSoftware: 'SALTO ProAccess SPACE Enterprise v6.4',
      apiSdk: 'SALTO Space REST API v2.1 & SHIP (SALTO Host Interface Protocol)',
      networkMethod: 'Ethernet TCP/IP Gateway (IQ3) with 868MHz Wireless Mesh Node Locks',
      authMethod: 'OAuth 2.0 Bearer Token with Mutual TLS (mTLS) Client Certificates',
      gatewayIpAddress: process.env.SALTO_GATEWAY_IP || '192.168.10.250',
      firmwareVersion: 'v5.12.04-BUILD-92',
    };
  }

  public async createCard(req: CreateCardRequest): Promise<AccessCardCredentials> {
    const cardId = `CARD-${Date.now().toString().slice(-8)}`;
    const randomHex = Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .toUpperCase()
      .padStart(6, '0');
    const cardNumber = `AC-KS-${randomHex}`;
    const pinCode = Math.floor(1000 + Math.random() * 9000).toString();
    const chipUid = `04:${randomHex.slice(0, 2)}:${randomHex.slice(2, 4)}:${randomHex.slice(4, 6)}:E1`;

    const now = new Date();
    const validFromDate = req.checkIn ? new Date(req.checkIn) : now;
    const validUntilDate = req.checkOut ? new Date(req.checkOut) : new Date(now.getTime() + 86400000 * 3);

    const card: AccessCardCredentials = {
      id: cardId,
      bookingId: req.bookingId,
      bookingReference: req.bookingReference,
      cardNumber,
      pinCode,
      digitalKeyToken: `BLE-SALTO-${cardId}-${Date.now()}`,
      qrAccessCode: `KS-GATE-PASS-${req.bookingReference}`,
      suiteName: req.suiteName,
      guestName: req.guestName,
      validFrom: validFromDate.toISOString(),
      validUntil: validUntilDate.toISOString(),
      status: 'INACTIVE',
      lifecycleStage: 'CARD_CREATED',
      physicalChipUid: chipUid,
      createdAt: now.toISOString(),
    };

    this.cardsMap.set(cardId, card);

    // Initial audit log entry
    this.addLog({
      cardId: card.id,
      cardNumber: card.cardNumber,
      guestName: card.guestName,
      doorId: 'ENCODER-DESK-01',
      doorName: 'Reception Card Encoder',
      eventType: 'ENTRY_GRANTED',
      accessGranted: true,
      batteryLevel: 100,
      timestamp: now.toISOString(),
      notes: `RFID MIFARE DESFire card encoded for booking ${req.bookingReference} (${req.suiteName})`,
    });

    return card;
  }

  public async activateCard(cardId: string): Promise<AccessCardCredentials> {
    const card = await this.getCardOrThrow(cardId);
    card.status = 'ACTIVE';
    card.lifecycleStage = 'CARD_ACTIVATED';
    this.cardsMap.set(cardId, card);

    this.addLog({
      cardId: card.id,
      cardNumber: card.cardNumber,
      guestName: card.guestName,
      doorId: 'SALTO-GATEWAY-MAIN',
      doorName: 'Main Perimeter Gate & Suite Locks',
      eventType: 'CARD_ACTIVATED',
      accessGranted: true,
      batteryLevel: 98,
      timestamp: new Date().toISOString(),
      notes: `Access card permissions synchronized to RF Mesh Lock Nodes for ${card.suiteName}`,
    });

    return card;
  }

  public async processCheckIn(cardId: string): Promise<{ card: AccessCardCredentials; doorLog: AccessDoorLog }> {
    const card = await this.getCardOrThrow(cardId);
    card.status = 'ACTIVE';
    card.lifecycleStage = 'GUEST_CHECKED_IN';
    card.lastAccessTime = new Date().toISOString();
    this.cardsMap.set(cardId, card);

    const doorLog: AccessDoorLog = {
      id: `LOG-${Date.now().toString().slice(-8)}`,
      cardId: card.id,
      cardNumber: card.cardNumber,
      guestName: card.guestName,
      doorId: `DOOR-${card.suiteName.replace(/\s+/g, '-').toUpperCase()}`,
      doorName: `${card.suiteName} Main Entry Door`,
      eventType: 'ENTRY_GRANTED',
      accessGranted: true,
      batteryLevel: 96,
      timestamp: new Date().toISOString(),
      notes: `First guest check-in tap at ${card.suiteName} lock. Key remains active until ${card.validUntil}`,
    };

    this.addLog(doorLog);
    return { card, doorLog };
  }

  public async processCheckOut(cardId: string): Promise<{ card: AccessCardCredentials; doorLog: AccessDoorLog }> {
    const card = await this.getCardOrThrow(cardId);
    card.status = 'EXPIRED';
    card.lifecycleStage = 'CHECKOUT';
    this.cardsMap.set(cardId, card);

    const doorLog: AccessDoorLog = {
      id: `LOG-${Date.now().toString().slice(-8)}`,
      cardId: card.id,
      cardNumber: card.cardNumber,
      guestName: card.guestName,
      doorId: `DOOR-${card.suiteName.replace(/\s+/g, '-').toUpperCase()}`,
      doorName: `${card.suiteName} Main Entry Door`,
      eventType: 'CARD_EXPIRED',
      accessGranted: false,
      batteryLevel: 95,
      timestamp: new Date().toISOString(),
      notes: `Checkout completed. Card credentials invalidated in SALTO SPACE software.`,
    };

    this.addLog(doorLog);
    return { card, doorLog };
  }

  public async expireCard(cardId: string): Promise<AccessCardCredentials> {
    const card = await this.getCardOrThrow(cardId);
    card.status = 'EXPIRED';
    card.lifecycleStage = 'CARD_EXPIRED';
    this.cardsMap.set(cardId, card);

    this.addLog({
      cardId: card.id,
      cardNumber: card.cardNumber,
      guestName: card.guestName,
      doorId: 'SALTO-GATEWAY-MAIN',
      doorName: 'Main Gateway',
      eventType: 'CARD_EXPIRED',
      accessGranted: false,
      batteryLevel: 94,
      timestamp: new Date().toISOString(),
      notes: `Card validity window lapsed (${card.validUntil}). Card expired automatically.`,
    });

    return card;
  }

  public async revokeCard(cardId: string, reason?: string): Promise<AccessCardCredentials> {
    const card = await this.getCardOrThrow(cardId);
    card.status = 'REVOKED';
    card.lifecycleStage = 'CARD_REVOKED';
    this.cardsMap.set(cardId, card);

    this.addLog({
      cardId: card.id,
      cardNumber: card.cardNumber,
      guestName: card.guestName,
      doorId: 'SALTO-GATEWAY-MAIN',
      doorName: 'Security Gate Lock Controller',
      eventType: 'CARD_EXPIRED',
      accessGranted: false,
      batteryLevel: 94,
      timestamp: new Date().toISOString(),
      notes: `Card forcibly revoked by security / management: ${reason || 'Manual override'}`,
    });

    return card;
  }

  public async getCardDetails(cardId: string): Promise<AccessCardCredentials | null> {
    // Search by card ID, card number, or booking ID
    for (const card of this.cardsMap.values()) {
      if (card.id === cardId || card.cardNumber === cardId || card.bookingId === cardId || card.bookingReference === cardId) {
        return card;
      }
    }
    return null;
  }

  public async simulateDoorAccess(req: SimulateEntryRequest): Promise<AccessDoorLog> {
    const card = await this.getCardDetails(req.cardId);
    if (!card) {
      throw new Error(`Access card '${req.cardId}' not found in hardware register`);
    }

    const isAccessAllowed = card.status === 'ACTIVE' && new Date(card.validUntil).getTime() > Date.now();
    const doorName = req.doorName || `${card.suiteName} Entrance`;
    const doorId = req.doorId || `DOOR-${card.suiteName.replace(/\s+/g, '-').toUpperCase()}`;

    const log: AccessDoorLog = {
      id: `LOG-${Date.now().toString().slice(-8)}`,
      cardId: card.id,
      cardNumber: card.cardNumber,
      guestName: card.guestName,
      doorId,
      doorName,
      eventType: isAccessAllowed ? 'ENTRY_GRANTED' : 'ENTRY_DENIED',
      accessGranted: isAccessAllowed,
      batteryLevel: 92,
      timestamp: new Date().toISOString(),
      notes: isAccessAllowed
        ? `Physical tap at ${doorName}. Solenoid disengaged for 5s.`
        : `Access DENIED at ${doorName}. Reason: Card status is ${card.status}`,
    };

    if (isAccessAllowed) {
      card.lastAccessTime = log.timestamp;
      card.lifecycleStage = 'CARD_REMAINS_ACTIVE';
      this.cardsMap.set(card.id, card);
    }

    this.addLog(log);
    return log;
  }

  public async getDoorAuditLogs(cardId?: string): Promise<AccessDoorLog[]> {
    if (!cardId) return [...this.doorLogsList].reverse();
    return this.doorLogsList.filter((l) => l.cardId === cardId || l.cardNumber === cardId).reverse();
  }

  private addLog(log: Omit<AccessDoorLog, 'id'> & { id?: string }) {
    const fullLog: AccessDoorLog = {
      id: log.id || `LOG-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 1000)}`,
      ...log,
    };
    this.doorLogsList.unshift(fullLog);
    if (this.doorLogsList.length > 100) {
      this.doorLogsList.pop();
    }
  }

  private async getCardOrThrow(cardId: string): Promise<AccessCardCredentials> {
    const card = await this.getCardDetails(cardId);
    if (!card) {
      throw new Error(`Access card '${cardId}' not found in lock system database`);
    }
    return card;
  }

  private seedDemoData() {
    const demoCard: AccessCardCredentials = {
      id: 'card-demo-102',
      bookingId: 'bkg-demo-102',
      bookingReference: 'KS-910234',
      cardNumber: 'AC-KS-0102',
      pinCode: '7821',
      digitalKeyToken: 'BLE-SALTO-DEMO-0102',
      qrAccessCode: 'KS-GATE-PASS-KS-910234',
      suiteName: 'Ambassador Executive Suite 2',
      guestName: 'Fatou Ceesay',
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 86400000 * 3).toISOString(),
      status: 'ACTIVE',
      lifecycleStage: 'CARD_ACTIVATED',
      physicalChipUid: '04:A2:3F:8C:E1',
      createdAt: new Date().toISOString(),
      lastAccessTime: new Date().toISOString(),
    };
    this.cardsMap.set(demoCard.id, demoCard);

    this.addLog({
      id: 'LOG-DEMO-1001',
      cardId: demoCard.id,
      cardNumber: demoCard.cardNumber,
      guestName: demoCard.guestName,
      doorId: 'DOOR-AMBASSADOR-EXEC-2',
      doorName: 'Ambassador Executive Suite 2 Door',
      eventType: 'ENTRY_GRANTED',
      accessGranted: true,
      batteryLevel: 98,
      timestamp: new Date().toISOString(),
      notes: 'Initial guest arrival scan. Lock unlatched cleanly.',
    });
  }
}
