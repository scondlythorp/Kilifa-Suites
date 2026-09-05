import {
  LockHardwareSpec,
  AccessCardCredentials,
  AccessDoorLog,
  CreateCardRequest,
  SimulateEntryRequest,
} from './types';

export interface IAccessControlAdapter {
  providerName: string;
  getHardwareSpec(): LockHardwareSpec;
  createCard(req: CreateCardRequest): Promise<AccessCardCredentials>;
  activateCard(cardId: string): Promise<AccessCardCredentials>;
  processCheckIn(cardId: string): Promise<{ card: AccessCardCredentials; doorLog: AccessDoorLog }>;
  processCheckOut(cardId: string): Promise<{ card: AccessCardCredentials; doorLog: AccessDoorLog }>;
  expireCard(cardId: string): Promise<AccessCardCredentials>;
  revokeCard(cardId: string, reason?: string): Promise<AccessCardCredentials>;
  getCardDetails(cardId: string): Promise<AccessCardCredentials | null>;
  simulateDoorAccess(req: SimulateEntryRequest): Promise<AccessDoorLog>;
  getDoorAuditLogs(cardId?: string): Promise<AccessDoorLog[]>;
}
