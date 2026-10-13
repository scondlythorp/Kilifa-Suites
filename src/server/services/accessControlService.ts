import { prisma, isDatabaseConnected } from '../db/prisma';
import { ApiError } from '../middleware/errorHandler';
import { accessControlManager } from '../access/AccessControlManager';
import { CreateCardRequest, SimulateEntryRequest } from '../access/types';
import { AccessCardStatus } from '@prisma/client';
import { notificationService } from './notificationService';

export class AccessControlService {
  public getHardwareSpec() {
    return accessControlManager.getHardwareSpec();
  }

  /**
   * Lifecycle Step 1 & 2: Booking confirmed -> Access card created & stored in Prisma
   */
  public async createCardForBooking(req: CreateCardRequest) {
    // 1. Hardware abstraction creation
    const cardData = await accessControlManager.handleBookingConfirmed(req);

    // 2. Persist in Prisma PostgreSQL Database if booking exists
    try {
      const booking = await prisma.booking.findFirst({
        where: { OR: [{ id: req.bookingId }, { bookingReference: req.bookingReference }] },
        include: { accessCard: true },
      });

      if (booking) {
        const validFrom = req.checkIn ? new Date(req.checkIn) : new Date();
        const validUntil = req.checkOut ? new Date(req.checkOut) : new Date(Date.now() + 86400000 * 3);

        if (booking.accessCard) {
          const updated = await prisma.accessCard.update({
            where: { id: booking.accessCard.id },
            data: {
              cardNumber: cardData.cardNumber,
              pinCode: cardData.pinCode,
              status: AccessCardStatus.INACTIVE,
              validFrom,
              validUntil,
            },
          });
          cardData.id = updated.id;
        } else {
          const newCard = await prisma.accessCard.create({
            data: {
              bookingId: booking.id,
              cardNumber: cardData.cardNumber,
              pinCode: cardData.pinCode,
              status: AccessCardStatus.INACTIVE,
              validFrom,
              validUntil,
            },
          });
          cardData.id = newCard.id;
        }
      }
    } catch (err) {
      console.warn('[ACCESS SERVICE] Prisma access card sync warning:', (err as Error).message);
    }

    return cardData;
  }

  /**
   * Lifecycle Step 3: Card activated
   */
  public async activateCard(cardId: string) {
    const cardData = await accessControlManager.activateAccessCard(cardId);

    try {
      await prisma.accessCard.updateMany({
        where: { OR: [{ id: cardId }, { cardNumber: cardId }] },
        data: { status: AccessCardStatus.ACTIVE },
      });

      if (cardData && cardData.guestName) {
        notificationService.notifyAccessCardInfo({
          email: `${cardData.guestName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          phone: '+2207000000',
          fullName: cardData.guestName,
          bookingReference: cardData.bookingReference || 'KS-REF',
          suiteName: cardData.suiteName || 'Kilifa Suite',
          cardNumber: cardData.cardNumber,
          pinCode: cardData.pinCode,
          validFrom: cardData.validFrom,
          validUntil: cardData.validUntil,
        }).catch((err) => console.warn('[CARD NOTIFICATION ERROR]', err));
      }
    } catch (err) {
      console.warn('[ACCESS SERVICE] Prisma activate update warning:', (err as Error).message);
    }

    return cardData;
  }

  /**
   * Lifecycle Step 4: Guest checks in -> Door unlatched & card activated
   */
  public async processGuestCheckIn(cardId: string) {
    const result = await accessControlManager.handleGuestCheckIn(cardId);

    try {
      await prisma.accessCard.updateMany({
        where: { OR: [{ id: cardId }, { cardNumber: cardId }] },
        data: { status: AccessCardStatus.ACTIVE },
      });
    } catch (err) {
      console.warn('[ACCESS SERVICE] Prisma checkin update warning:', (err as Error).message);
    }

    return result;
  }

  /**
   * Lifecycle Step 5: Door Tap / Access log simulation
   */
  public async simulateDoorEntry(req: SimulateEntryRequest) {
    return accessControlManager.simulateDoorEntry(req);
  }

  /**
   * Lifecycle Step 6 & 7: Guest checkout -> Card expires
   */
  public async processGuestCheckOut(cardId: string) {
    const result = await accessControlManager.handleGuestCheckOut(cardId);

    try {
      await prisma.accessCard.updateMany({
        where: { OR: [{ id: cardId }, { cardNumber: cardId }] },
        data: { status: AccessCardStatus.EXPIRED },
      });
    } catch (err) {
      console.warn('[ACCESS SERVICE] Prisma checkout update warning:', (err as Error).message);
    }

    return result;
  }

  /**
   * Revoke or Expire Card
   */
  public async revokeCard(cardId: string, reason?: string) {
    const cardData = await accessControlManager.revokeCard(cardId, reason);

    try {
      await prisma.accessCard.updateMany({
        where: { OR: [{ id: cardId }, { cardNumber: cardId }] },
        data: { status: AccessCardStatus.REVOKED },
      });
    } catch (err) {
      console.warn('[ACCESS SERVICE] Prisma revoke update warning:', (err as Error).message);
    }

    return cardData;
  }

  public async getCardDetails(cardId: string) {
    const cardData = await accessControlManager.getCardDetails(cardId);

    if (!cardData) {
      try {
        const dbCard = await prisma.accessCard.findFirst({
          where: { OR: [{ id: cardId }, { cardNumber: cardId }, { bookingId: cardId }] },
          include: { booking: { include: { suite: true } } },
        });

        if (dbCard) {
          return {
            id: dbCard.id,
            bookingId: dbCard.bookingId,
            bookingReference: dbCard.booking?.bookingReference || 'N/A',
            cardNumber: dbCard.cardNumber,
            pinCode: dbCard.pinCode,
            digitalKeyToken: `BLE-SALTO-${dbCard.id}`,
            qrAccessCode: `KS-GATE-PASS-${dbCard.booking?.bookingReference}`,
            suiteName: dbCard.booking?.suite?.name || 'DAR',
            guestName: dbCard.booking?.fullName || 'Guest',
            validFrom: dbCard.validFrom.toISOString(),
            validUntil: dbCard.validUntil.toISOString(),
            status: dbCard.status as any,
            lifecycleStage: (dbCard.status === 'ACTIVE' ? 'CARD_ACTIVATED' : 'CARD_CREATED') as any,
            physicalChipUid: '04:A1:B2:C3:D4',
            createdAt: dbCard.createdAt.toISOString(),
          };
        }
      } catch (err) {
        console.warn('[ACCESS SERVICE] Prisma card lookup failed:', (err as Error).message);
      }
    }

    return cardData;
  }

  public async getDoorAuditLogs(cardId?: string) {
    return accessControlManager.getDoorAuditLogs(cardId);
  }

  public async getAllCards() {
    if (isDatabaseConnected()) {
      try {
        const dbCards = await prisma.accessCard.findMany({
          include: { booking: { include: { suite: true } } },
          orderBy: { createdAt: 'desc' },
        });

        if (dbCards && dbCards.length > 0) {
          return dbCards.map((c) => ({
            id: c.id,
            bookingId: c.bookingId,
            bookingReference: c.booking?.bookingReference || 'N/A',
            cardNumber: c.cardNumber,
            pinCode: c.pinCode,
            digitalKeyToken: `BLE-SALTO-${c.id}`,
            suiteName: c.booking?.suite?.name || 'Suite',
            guestName: c.booking?.fullName || 'Guest',
            validFrom: c.validFrom.toISOString(),
            validUntil: c.validUntil.toISOString(),
            status: c.status,
            createdAt: c.createdAt.toISOString(),
          }));
        }
      } catch (err) {
        // Fall back to demo card silently
      }
    }

    // Fallback: return mock demo card
    const demoCard = await accessControlManager.getCardDetails('card-demo-102');
    return demoCard ? [demoCard] : [];
  }
}

export const accessControlService = new AccessControlService();
