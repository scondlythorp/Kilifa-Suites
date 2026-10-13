import { SUITES_DATA } from '../../config/business';
import { ApiError } from '../middleware/errorHandler';
import { prisma, isDatabaseConnected } from '../db/prisma';
import { BookingStatus, PaymentStatus, PaymentMethod, AccessCardStatus } from '@prisma/client';
import { accessControlService } from './accessControlService';
import { notificationService } from './notificationService';
import { isMemoryFallbackAllowed } from '../config/envConfig';

export interface CreateBookingDTO {
  fullName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  suiteId: string;
  preferredSuite?: string;
  specialRequests?: string;
  idempotencyKey?: string;
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
      fullName: 'Lamin Touray',
      email: 'lamin.touray@example.com',
      phone: '+2207000000',
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      guestsCount: 2,
      preferredSuite: 'suite-01',
      suiteName: 'DAR',
      pricePerNight: 2500,
      totalNights: 3,
      totalEstimatedPrice: 7500,
      specialRequests: 'Airport shuttle pickup requested',
      status: 'PENDING',
      payment: {
        id: 'pmt-demo-101',
        amount: 7500,
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
      suiteName: 'SAMA',
      pricePerNight: 2500,
      totalNights: 2,
      totalEstimatedPrice: 5000,
      specialRequests: 'Late check-in expected around 8 PM',
      status: 'CONFIRMED',
      payment: {
        id: 'pmt-demo-102',
        amount: 5000,
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
    const targetSuiteId = (data.suiteId || data.preferredSuite)?.trim();
    if (!targetSuiteId) {
      throw new ApiError(400, 'Suite identifier (suiteId) is required.');
    }

    const [sy, sm, sd] = data.checkIn.split('-').map(Number);
    const [ey, em, ed] = data.checkOut.split('-').map(Number);
    const startUtc = Date.UTC(sy, sm - 1, sd);
    const endUtc = Date.UTC(ey, em - 1, ed);
    const nights = Math.max(1, Math.round((endUtc - startUtc) / 86400000));
    const start = new Date(data.checkIn);
    const end = new Date(data.checkOut);

    // Static fallback lookup if database is unavailable or initializing
    const targetSuiteLower = targetSuiteId.toLowerCase();
    const staticSuite = SUITES_DATA.find(
      (s) =>
        s.id.toLowerCase() === targetSuiteLower ||
        s.slug.toLowerCase() === targetSuiteLower ||
        s.name.toLowerCase() === targetSuiteLower
    );

    try {
      // 1. Resolve Suite Authoritatively from Database
      let dbSuite = await prisma.suite.findFirst({
        where: {
          OR: [
            { id: targetSuiteId },
            { slug: targetSuiteId },
            { name: { equals: targetSuiteId, mode: 'insensitive' } },
          ],
        },
      });

      // If DB has no suites yet, check static catalog
      if (!dbSuite && !staticSuite) {
        throw new ApiError(404, `The requested suite '${targetSuiteId}' was not found.`);
      }

      const suiteName = dbSuite ? dbSuite.name : staticSuite!.name;
      const pricePerNight = dbSuite ? dbSuite.pricePerNight : staticSuite!.pricePerNight;
      const maxOccupancy = dbSuite ? dbSuite.maxOccupancy : staticSuite!.maxOccupancy;

      // Validate occupancy
      if (data.guestsCount > maxOccupancy) {
        throw new ApiError(
          400,
          `Guest count (${data.guestsCount}) exceeds the maximum occupancy of ${maxOccupancy} for ${suiteName}.`
        );
      }

      // Authoritative server-side price calculation
      const totalEstimatedPrice = pricePerNight * nights;

      // 2. Idempotency Check
      if (data.idempotencyKey) {
        const existingByIdempotency = await prisma.booking.findUnique({
          where: { idempotencyKey: data.idempotencyKey },
          include: { suite: true, payment: true, accessCard: true },
        });

        if (existingByIdempotency) {
          return this.mapPrismaToRecord(existingByIdempotency);
        }
      }

      // 3. Rapid duplicate submission check (within 60 seconds by same email for same suite & dates)
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const recentDuplicate = await prisma.booking.findFirst({
        where: {
          email: data.email.toLowerCase(),
          suiteId: dbSuite?.id || targetSuiteId,
          checkIn: start,
          checkOut: end,
          createdAt: { gte: oneMinuteAgo },
        },
        include: { suite: true, payment: true, accessCard: true },
      });

      if (recentDuplicate) {
        return this.mapPrismaToRecord(recentDuplicate);
      }

      const resolvedSuiteId = dbSuite ? dbSuite.id : targetSuiteId;

      // 4. Overlapping Availability Check & Atomic Reservation Creation
      const created = await prisma.$transaction(async (tx) => {
        // Concurrency check: verify no overlapping active bookings exist for this suite
        const conflictingBooking = await tx.booking.findFirst({
          where: {
            suiteId: resolvedSuiteId,
            status: {
              in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN],
            },
            // Standard date overlap logic: (ExistingStart < RequestedEnd) AND (ExistingEnd > RequestedStart)
            checkIn: { lt: end },
            checkOut: { gt: start },
          },
        });

        if (conflictingBooking) {
          throw new ApiError(
            409,
            `The requested suite '${suiteName}' is already reserved for the selected dates (${data.checkIn} to ${data.checkOut}). Please select alternative dates or an available suite.`
          );
        }

        // Upsert Guest Profile
        const guest = await tx.guest.upsert({
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

        const bookingReference = `KS-${Math.floor(100000 + Math.random() * 900000)}`;

        return tx.booking.create({
          data: {
            bookingReference,
            idempotencyKey: data.idempotencyKey || null,
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
            suiteId: resolvedSuiteId,
            guestId: guest.id,
            payment: {
              create: {
                amount: totalEstimatedPrice,
                currency: 'GMD',
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
      });

      // Trigger BOOKING_RECEIVED Notification across channels
      notificationService
        .notifyBookingReceived({
          email: created.email,
          phone: created.phone,
          fullName: created.fullName,
          bookingReference: created.bookingReference,
          suiteName: created.suite ? created.suite.name : suiteName,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
        })
        .catch((err) => console.warn('[NOTIFICATION TRIGGER ERROR]', err));

      return this.mapPrismaToRecord(created);
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }

      // Check if memory fallback is strictly forbidden
      if (!isMemoryFallbackAllowed()) {
        console.error(
          '[BOOKING SERVICE] Database operation failed and memory fallback is prohibited:',
          err.message
        );
        throw new ApiError(
          503,
          'Reservation service is currently undergoing maintenance or database reconnect. Please try again in a few moments.'
        );
      }

      console.warn(
        '[BOOKING SERVICE] Database query failed, evaluating memory fallback:',
        err.message
      );
    }

    // Fallback store handling (Development / Prototype Mode Only)
    if (!staticSuite) {
      throw new ApiError(404, `Suite '${targetSuiteId}' was not found in catalog.`);
    }

    if (data.guestsCount > staticSuite.maxOccupancy) {
      throw new ApiError(
        400,
        `Guest count (${data.guestsCount}) exceeds the maximum occupancy of ${staticSuite.maxOccupancy} for ${staticSuite.name}.`
      );
    }

    // Check overlap in fallback store
    const hasOverlapInFallback = this.fallbackBookings.some((b) => {
      if (b.preferredSuite !== targetSuiteId && b.suiteName !== staticSuite.name) return false;
      if (b.status === 'CANCELLED') return false;
      const bStart = new Date(b.checkIn).getTime();
      const bEnd = new Date(b.checkOut).getTime();
      return bStart < end.getTime() && bEnd > start.getTime();
    });

    if (hasOverlapInFallback) {
      throw new ApiError(
        409,
        `The requested suite '${staticSuite.name}' is already reserved for the selected dates. Please select alternative dates.`
      );
    }

    const pricePerNight = staticSuite.pricePerNight;
    const totalEstimatedPrice = pricePerNight * nights;
    const bookingReference = `KS-${Math.floor(100000 + Math.random() * 900000)}`;
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
      preferredSuite: targetSuiteId,
      suiteName: staticSuite.name,
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
    if (isDatabaseConnected()) {
      try {
        const booking = await prisma.booking.findFirst({
          where: {
            OR: [{ id }, { bookingReference: id }],
          },
          include: {
            suite: true,
            payment: true,
            accessCard: true,
          },
        });

        if (booking) {
          return this.mapPrismaToRecord(booking);
        }
      } catch (err) {
        if (err instanceof ApiError) throw err;
      }
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
    if (isDatabaseConnected()) {
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
          return bookings.map((b) => this.mapPrismaToRecord(b));
        }
      } catch (err) {
        if (err instanceof ApiError) throw err;
      }
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
          notificationService
            .notifyBookingConfirmed({
              email: updated.email,
              phone: updated.phone,
              fullName: updated.fullName,
              bookingReference: updated.bookingReference,
              suiteName: updated.suite ? updated.suite.name : 'Kilifa Suite',
              checkIn: updated.checkIn.toISOString().split('T')[0],
              checkOut: updated.checkOut.toISOString().split('T')[0],
            })
            .catch((err) => console.warn('[NOTIFICATION ERROR]', err));
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
          notificationService
            .notifyBookingCancellation({
              email: updated.email,
              phone: updated.phone,
              fullName: updated.fullName,
              bookingReference: updated.bookingReference,
              suiteName: updated.suite ? updated.suite.name : 'Kilifa Suite',
            })
            .catch((err) => console.warn('[NOTIFICATION ERROR]', err));
        }

        const resRecord = this.mapPrismaToRecord(updated);
        const idx = this.fallbackBookings.findIndex((b) => b.id === id || b.bookingReference === id);
        if (idx !== -1) {
          this.fallbackBookings[idx] = resRecord;
        }

        return resRecord;
      }
    } catch (err) {
      if (!isMemoryFallbackAllowed()) {
        throw new ApiError(503, 'Database service is temporarily unavailable. Please try again shortly.');
      }
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

  private mapPrismaToRecord(b: any): BookingRecord {
    return {
      id: b.id,
      bookingReference: b.bookingReference,
      fullName: b.fullName,
      email: b.email,
      phone: b.phone,
      checkIn: b.checkIn instanceof Date ? b.checkIn.toISOString().split('T')[0] : b.checkIn,
      checkOut: b.checkOut instanceof Date ? b.checkOut.toISOString().split('T')[0] : b.checkOut,
      guestsCount: b.guestsCount,
      preferredSuite: b.suiteId,
      suiteName: b.suite ? b.suite.name : 'Royal Suite',
      pricePerNight: b.pricePerNight,
      totalNights: b.totalNights,
      totalEstimatedPrice: b.totalEstimatedPrice,
      specialRequests: b.specialRequests || '',
      status: b.status,
      payment: b.payment
        ? {
            id: b.payment.id,
            amount: b.payment.amount,
            status: b.payment.status,
          }
        : undefined,
      accessCard: b.accessCard
        ? {
            id: b.accessCard.id,
            cardNumber: b.accessCard.cardNumber,
            status: b.accessCard.status,
          }
        : undefined,
      createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
    };
  }
}

export const bookingService = new BookingService();
