import { SUITES_DATA } from '../../config/business';
import { ApiError } from '../middleware/errorHandler';
import { prisma } from '../db/prisma';
import { BookingStatus, PaymentStatus, PaymentMethod, AccessCardStatus } from '@prisma/client';
import { accessControlService } from './accessControlService';
import { notificationService } from './notificationService';

export interface CreateBookingDTO {
  fullName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  preferredSuite: string;
  specialRequests?: string;
}

export interface BookingRecord {
  id: string;
  bookingReference: string;
  fullName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  preferredSuite: string;
  suiteName: string;
  pricePerNight: number;
  totalNights: number;
  totalEstimatedPrice: number;
  specialRequests?: string;
  status: string;
  payment?: {
    id: string;
    amount: number;
    status: string;
  };
  accessCard?: {
    id: string;
    cardNumber: string;
    status: string;
  };
  createdAt: string;
}

class BookingService {
  private fallbackBookings: BookingRecord[] = [
    {
      id: 'bkg-demo-101',
      bookingReference: 'KS-882910',
      fullName: 'Musa Njie',
      email: 'musa.njie@example.com',
      phone: '+2207000000',
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      guestsCount: 2,
      preferredSuite: 'suite-01',
      suiteName: 'Royal Diplomatic Suite 1',
      pricePerNight: 180,
      totalNights: 3,
      totalEstimatedPrice: 540,
      specialRequests: 'Airport shuttle pickup requested',
      status: 'PENDING',
      payment: {
        id: 'pmt-demo-101',
        amount: 540,
        status: 'PENDING',
      },
      accessCard: {
        id: 'card-demo-101',
        cardNumber: 'AC-KS-0101',
        status: 'INACTIVE',
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'bkg-demo-102',
      bookingReference: 'KS-910234',
      fullName: 'Fatou Ceesay',
      email: 'fatou.ceesay@example.com',
      phone: '+2207112233',
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      guestsCount: 1,
      preferredSuite: 'suite-02',
      suiteName: 'Ambassador Executive Suite 2',
      pricePerNight: 150,
      totalNights: 2,
      totalEstimatedPrice: 300,
      specialRequests: 'Late check-in expected around 8 PM',
      status: 'CONFIRMED',
      payment: {
        id: 'pmt-demo-102',
        amount: 300,
        status: 'PAID',
      },
      accessCard: {
        id: 'card-demo-102',
        cardNumber: 'AC-KS-0102',
        status: 'ACTIVE',
      },
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  public async createBooking(data: CreateBookingDTO): Promise<BookingRecord> {
    const suite = SUITES_DATA.find(
      (s) => s.id === data.preferredSuite || s.slug === data.preferredSuite
    );

    const suiteName = suite ? suite.name : data.preferredSuite;
    const pricePerNight = suite ? suite.pricePerNight : 120;

    const start = new Date(data.checkIn);
    const end = new Date(data.checkOut);
    const diffTime = end.getTime() - start.getTime();
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const totalEstimatedPrice = pricePerNight * nights;

    const bookingReference = `KS-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      let dbSuite = await prisma.suite.findFirst({
        where: { OR: [{ id: data.preferredSuite }, { slug: data.preferredSuite }] },
      });

      if (!dbSuite) {
        dbSuite = await prisma.suite.findFirst();
      }

      if (dbSuite) {
        const guest = await prisma.guest.upsert({
          where: { email: data.email.toLowerCase() },
          update: {
            fullName: data.fullName,
            phone: data.phone,
            totalBookings: { increment: 1 },
          },
          create: {
            fullName: data.fullName,
            email: data.email.toLowerCase(),
            phone: data.phone,
            totalBookings: 1,
          },
        });

        const created = await prisma.booking.create({
          data: {
            bookingReference,
            fullName: data.fullName,
            email: data.email.toLowerCase(),
            phone: data.phone,
            checkIn: start,
            checkOut: end,
            guestsCount: data.guestsCount,
            pricePerNight,
            totalNights: nights,
            totalEstimatedPrice,
            specialRequests: data.specialRequests || '',
            status: BookingStatus.PENDING,
            suiteId: dbSuite.id,
            guestId: guest.id,
            payment: {
              create: {
                amount: totalEstimatedPrice,
                currency: 'USD',
                status: PaymentStatus.PENDING,
                method: PaymentMethod.CASH,
                transactionRef: `TXN-${bookingReference}`,
              },
            },
            accessCard: {
              create: {
                cardNumber: `AC-${bookingReference}`,
                pinCode: `${Math.floor(1000 + Math.random() * 9000)}`,
                status: AccessCardStatus.INACTIVE,
                validFrom: start,
                validUntil: end,
              },
            },
          },
          include: {
            suite: true,
            payment: true,
            accessCard: true,
          },
        });

        // Trigger BOOKING_RECEIVED Notification across channels
        notificationService.notifyBookingReceived({
          email: created.email,
          phone: created.phone,
          fullName: created.fullName,
          bookingReference: created.bookingReference,
          suiteName: created.suite ? created.suite.name : suiteName,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
        }).catch((err) => console.warn('[NOTIFICATION TRIGGER ERROR]', err));

        return {
          id: created.id,
          bookingReference: created.bookingReference,
          fullName: created.fullName,
          email: created.email,
          phone: created.phone,
          checkIn: created.checkIn.toISOString().split('T')[0],
          checkOut: created.checkOut.toISOString().split('T')[0],
          guestsCount: created.guestsCount,
          preferredSuite: data.preferredSuite,
          suiteName: created.suite ? created.suite.name : suiteName,
          pricePerNight: created.pricePerNight,
          totalNights: created.totalNights,
          totalEstimatedPrice: created.totalEstimatedPrice,
          specialRequests: created.specialRequests || '',
          status: created.status,
          payment: created.payment ? {
            id: created.payment.id,
            amount: created.payment.amount,
            status: created.payment.status,
          } : undefined,
          accessCard: created.accessCard ? {
            id: created.accessCard.id,
            cardNumber: created.accessCard.cardNumber,
            status: created.accessCard.status,
          } : undefined,
          createdAt: created.createdAt.toISOString(),
        };
      }
    } catch (err) {
      console.warn('[BOOKING SERVICE] Prisma save failed, using memory store fallback:', (err as Error).message);
    }

    const id = `bkg-${Date.now()}`;
    const newBooking: BookingRecord = {
      id,
      bookingReference,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guestsCount: data.guestsCount,
      preferredSuite: data.preferredSuite,
      suiteName,
      pricePerNight,
      totalNights: nights,
      totalEstimatedPrice,
      specialRequests: data.specialRequests || '',
      status: 'PENDING',
      payment: {
        id: `pmt-${Date.now()}`,
        amount: totalEstimatedPrice,
        status: 'PENDING',
      },
      accessCard: {
        id: `card-${Date.now()}`,
        cardNumber: `AC-${bookingReference}`,
        status: 'INACTIVE',
      },
      createdAt: new Date().toISOString(),
    };

    this.fallbackBookings.push(newBooking);
    return newBooking;
  }

  public async getBookingById(id: string): Promise<BookingRecord> {
    try {
      const booking = await prisma.booking.findFirst({
        where: {
          OR: [
            { id },
            { bookingReference: id },
          ],
        },
        include: {
          suite: true,
          payment: true,
          accessCard: true,
        },
      });

      if (booking) {
        return {
          id: booking.id,
          bookingReference: booking.bookingReference,
          fullName: booking.fullName,
          email: booking.email,
          phone: booking.phone,
          checkIn: booking.checkIn.toISOString().split('T')[0],
          checkOut: booking.checkOut.toISOString().split('T')[0],
          guestsCount: booking.guestsCount,
          preferredSuite: booking.suiteId,
          suiteName: booking.suite ? booking.suite.name : 'Royal Suite',
          pricePerNight: booking.pricePerNight,
          totalNights: booking.totalNights,
          totalEstimatedPrice: booking.totalEstimatedPrice,
          specialRequests: booking.specialRequests || '',
          status: booking.status,
          payment: booking.payment ? {
            id: booking.payment.id,
            amount: booking.payment.amount,
            status: booking.payment.status,
          } : undefined,
          accessCard: booking.accessCard ? {
            id: booking.accessCard.id,
            cardNumber: booking.accessCard.cardNumber,
            status: booking.accessCard.status,
          } : undefined,
          createdAt: booking.createdAt.toISOString(),
        };
      }
    } catch (err) {
      console.warn('[BOOKING SERVICE] Prisma query failed, using memory fallback:', (err as Error).message);
    }

    const fallback = this.fallbackBookings.find(
      (b) => b.id === id || b.bookingReference === id
    );

    if (!fallback) {
      throw new ApiError(404, `Booking record '${id}' not found`);
    }

    return fallback;
  }

  public async getAllBookings(): Promise<BookingRecord[]> {
    try {
      const bookings = await prisma.booking.findMany({
        include: {
          suite: true,
          payment: true,
          accessCard: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (bookings && bookings.length > 0) {
        return bookings.map((b) => ({
          id: b.id,
          bookingReference: b.bookingReference,
          fullName: b.fullName,
          email: b.email,
          phone: b.phone,
          checkIn: b.checkIn.toISOString().split('T')[0],
          checkOut: b.checkOut.toISOString().split('T')[0],
          guestsCount: b.guestsCount,
          preferredSuite: b.suiteId,
          suiteName: b.suite ? b.suite.name : 'Royal Suite',
          pricePerNight: b.pricePerNight,
          totalNights: b.totalNights,
          totalEstimatedPrice: b.totalEstimatedPrice,
          specialRequests: b.specialRequests || '',
          status: b.status,
          payment: b.payment ? {
            id: b.payment.id,
            amount: b.payment.amount,
            status: b.payment.status,
          } : undefined,
          accessCard: b.accessCard ? {
            id: b.accessCard.id,
            cardNumber: b.accessCard.cardNumber,
            status: b.accessCard.status,
          } : undefined,
          createdAt: b.createdAt.toISOString(),
        }));
      }
    } catch (err) {
      console.warn('[BOOKING SERVICE] Prisma query failed, returning fallback list:', (err as Error).message);
    }

    return this.fallbackBookings;
  }

  public async updateBookingStatus(id: string, status: string): Promise<BookingRecord> {
    const validStatuses = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'];
    const normalizedStatus = status.toUpperCase().trim();

    if (!validStatuses.includes(normalizedStatus)) {
      throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    try {
      const existing = await prisma.booking.findFirst({
        where: { OR: [{ id }, { bookingReference: id }] },
      });

      if (existing) {
        const updated = await prisma.booking.update({
          where: { id: existing.id },
          data: { status: normalizedStatus as BookingStatus },
          include: { suite: true, payment: true, accessCard: true },
        });

        // Trigger access card hardware lifecycle transitions & notifications
        if (normalizedStatus === 'CONFIRMED') {
          if (updated.payment) {
            await prisma.payment.update({
              where: { id: updated.payment.id },
              data: { status: PaymentStatus.COMPLETED },
            });
          }
          if (updated.accessCard) {
            await accessControlService.activateCard(updated.accessCard.id);
          }
          notificationService.notifyBookingConfirmed({
            email: updated.email,
            phone: updated.phone,
            fullName: updated.fullName,
            bookingReference: updated.bookingReference,
            suiteName: updated.suite ? updated.suite.name : 'Kilifa Suite',
            checkIn: updated.checkIn.toISOString().split('T')[0],
            checkOut: updated.checkOut.toISOString().split('T')[0],
          }).catch((err) => console.warn('[NOTIFICATION ERROR]', err));
        } else if (normalizedStatus === 'CHECKED_IN') {
          if (updated.accessCard) {
            await accessControlService.processGuestCheckIn(updated.accessCard.id);
          }
        } else if (normalizedStatus === 'CHECKED_OUT') {
          if (updated.accessCard) {
            await accessControlService.processGuestCheckOut(updated.accessCard.id);
          }
        } else if (normalizedStatus === 'CANCELLED') {
          if (updated.accessCard) {
            await accessControlService.processGuestCheckOut(updated.accessCard.id);
          }
          notificationService.notifyBookingCancellation({
            email: updated.email,
            phone: updated.phone,
            fullName: updated.fullName,
            bookingReference: updated.bookingReference,
            suiteName: updated.suite ? updated.suite.name : 'Kilifa Suite',
          }).catch((err) => console.warn('[NOTIFICATION ERROR]', err));
        }

        const resRecord: BookingRecord = {
          id: updated.id,
          bookingReference: updated.bookingReference,
          fullName: updated.fullName,
          email: updated.email,
          phone: updated.phone,
          checkIn: updated.checkIn.toISOString().split('T')[0],
          checkOut: updated.checkOut.toISOString().split('T')[0],
          guestsCount: updated.guestsCount,
          preferredSuite: updated.suiteId,
          suiteName: updated.suite ? updated.suite.name : 'Royal Suite',
          pricePerNight: updated.pricePerNight,
          totalNights: updated.totalNights,
          totalEstimatedPrice: updated.totalEstimatedPrice,
          specialRequests: updated.specialRequests || '',
          status: updated.status,
          createdAt: updated.createdAt.toISOString(),
        };

        const idx = this.fallbackBookings.findIndex((b) => b.id === id || b.bookingReference === id);
        if (idx !== -1) {
          this.fallbackBookings[idx] = resRecord;
        }

        return resRecord;
      }
    } catch (err) {
      console.warn('[BOOKING SERVICE] Prisma status update failed, updating memory fallback:', (err as Error).message);
    }

    const idx = this.fallbackBookings.findIndex((b) => b.id === id || b.bookingReference === id);
    if (idx !== -1) {
      this.fallbackBookings[idx].status = normalizedStatus;
      if (normalizedStatus === 'CONFIRMED' && this.fallbackBookings[idx].payment) {
        this.fallbackBookings[idx].payment!.status = 'PAID';
      }
      if (normalizedStatus === 'CHECKED_IN' && this.fallbackBookings[idx].accessCard) {
        this.fallbackBookings[idx].accessCard!.status = 'ACTIVE';
      }
      return this.fallbackBookings[idx];
    }

    throw new ApiError(404, `Booking '${id}' not found`);
  }
}

export const bookingService = new BookingService();
