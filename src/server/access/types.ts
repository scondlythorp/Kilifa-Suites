export interface LockHardwareSpec {
  lockManufacturer: string;
  hardwareModel: string;
  cardTechnology: string;
  accessControlSoftware: string;
  apiSdk: string;
  networkMethod: string;
  authMethod: string;
  gatewayIpAddress?: string;
  firmwareVersion?: string;
}

export type AccessCardLifecycleStage =
  | 'BOOKING_CONFIRMED'
  | 'CARD_CREATED'
  | 'CARD_ACTIVATED'
  | 'GUEST_CHECKED_IN'
  | 'CARD_REMAINS_ACTIVE'
  | 'CHECKOUT'
  | 'CARD_EXPIRED'
  | 'CARD_REVOKED';

export type AccessCardState = 'INACTIVE' | 'ACTIVE' | 'EXPIRED' | 'REVOKED';

export interface AccessCardCredentials {
  id: string;
  bookingId: string;
  bookingReference: string;
  cardNumber: string;
  pinCode: string;
  digitalKeyToken: string;
  qrAccessCode: string;
  suiteName: string;
  guestName: string;
  validFrom: string;
  validUntil: string;
  status: AccessCardState;
  lifecycleStage: AccessCardLifecycleStage;
  physicalChipUid: string;
  createdAt: string;
  lastAccessTime?: string;
}

export interface AccessDoorLog {
  id: string;
  cardId: string;
  cardNumber: string;
  guestName: string;
  doorId: string;
  doorName: string;
  eventType: 'ENTRY_GRANTED' | 'ENTRY_DENIED' | 'CARD_ACTIVATED' | 'CARD_EXPIRED' | 'REMOTE_UNLOCK';
  accessGranted: boolean;
  batteryLevel: number; // Percentage
  timestamp: string;
  notes?: string;
}

export interface CreateCardRequest {
  bookingId: string;
  bookingReference: string;
  guestName: string;
  suiteName: string;
  checkIn: string;
  checkOut: string;
}

export interface SimulateEntryRequest {
  cardId: string;
  doorId?: string;
  doorName?: string;
}
