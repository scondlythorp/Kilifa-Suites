import { ApiError } from '../middleware/errorHandler';
import { prisma, isDatabaseConnected } from '../db/prisma';
import { BookingRecord } from './bookingService';

export interface GuestProfileWithHistory {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  vipStatus: boolean;
  totalBookings: number;
  totalSpend?: number;
  createdAt: string;
  bookings: BookingRecord[];
}

class GuestService {
  private fallbackGuests: GuestProfileWithHistory[] = [
    {
      id: 'gst-101',
      fullName: 'Musa Njie',
      email: 'musa.njie@example.com',
      phone: '+2207000000',
      country: 'The Gambia',
      vipStatus: true,
      totalBookings: 2,
      totalSpend: 7500,
      createdAt: '2026-01-15T10:00:00Z',
      bookings: [
        {
          id: 'bkg-demo-101',
          bookingReference: 'KS-882910',
          fullName: 'Musa Njie',
          email: 'musa.njie@example.com',
          phone: '+2207000000',
          checkIn: '2026-08-20',
          checkOut: '2026-08-23',
          guestsCount: 2,
          preferredSuite: 'suite-01',
          suiteName: 'DAR',
          pricePerNight: 2500,
          totalNights: 3,
          totalEstimatedPrice: 7500,
          specialRequests: 'Airport shuttle pickup requested & late check-in',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'gst-102',
      fullName: 'Fatou Ceesay',
      email: 'fatou.ceesay@example.com',
      phone: '+2207112233',
      country: 'Senegal',
      vipStatus: false,
      totalBookings: 1,
      totalSpend: 5000,
      createdAt: '2026-03-22T14:30:00Z',
      bookings: [
        {
          id: 'bkg-demo-102',
          bookingReference: 'KS-910234',
          fullName: 'Fatou Ceesay',
          email: 'fatou.ceesay@example.com',
          phone: '+2207112233',
          checkIn: '2026-08-10',
          checkOut: '2026-08-12',
          guestsCount: 1,
          preferredSuite: 'suite-02',
          suiteName: 'SAMA',
          pricePerNight: 2500,
          totalNights: 2,
          totalEstimatedPrice: 5000,
          specialRequests: 'Extra hypoallergenic pillows requested',
          status: 'CHECKED_IN',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
    },
  ];

  public async getAllGuests(): Promise<GuestProfileWithHistory[]> {
    if (isDatabaseConnected()) {
      try {
        const guests = await prisma.guest.findMany({
          include: {
            bookings: {
              include: { suite: true, payment: true },
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (guests && guests.length > 0) {
          return guests.map((g) => {
            const totalSpend = g.bookings.reduce((sum, b) => sum + (b.totalEstimatedPrice || 0), 0);
            return {
              id: g.id,
              fullName: g.fullName,
              email: g.email,
              phone: g.phone,
              country: g.country || 'The Gambia',
              vipStatus: g.vipStatus,
              totalBookings: g.totalBookings || g.bookings.length,
              totalSpend,
              createdAt: g.createdAt.toISOString(),
              bookings: g.bookings.map((b) => ({
                id: b.id,
                bookingReference: b.bookingReference,
                fullName: b.fullName,
                email: b.email,
                phone: b.phone,
                checkIn: b.checkIn.toISOString().split('T')[0],
                checkOut: b.checkOut.toISOString().split('T')[0],
                guestsCount: b.guestsCount,
                preferredSuite: b.suiteId,
                suiteName: b.suite ? b.suite.name : 'DAR',
                pricePerNight: b.pricePerNight,
                totalNights: b.totalNights,
                totalEstimatedPrice: b.totalEstimatedPrice,
                specialRequests: b.specialRequests || '',
                status: b.status,
                createdAt: b.createdAt.toISOString(),
              })),
            };
          });
        }
      } catch (err) {
        if (err instanceof ApiError) throw err;
      }
    }

    return this.fallbackGuests;
  }

  public async getGuestById(id: string): Promise<GuestProfileWithHistory> {
    if (isDatabaseConnected()) {
      try {
        const guest = await prisma.guest.findFirst({
          where: { OR: [{ id }, { email: id }] },
          include: {
            bookings: {
              include: { suite: true, payment: true },
              orderBy: { createdAt: 'desc' },
            },
          },
        });

        if (guest) {
          const totalSpend = guest.bookings.reduce((sum, b) => sum + (b.totalEstimatedPrice || 0), 0);
          return {
            id: guest.id,
            fullName: guest.fullName,
            email: guest.email,
            phone: guest.phone,
            country: guest.country || 'The Gambia',
            vipStatus: guest.vipStatus,
            totalBookings: guest.totalBookings || guest.bookings.length,
            totalSpend,
            createdAt: guest.createdAt.toISOString(),
            bookings: guest.bookings.map((b) => ({
              id: b.id,
              bookingReference: b.bookingReference,
              fullName: b.fullName,
              email: b.email,
              phone: b.phone,
              checkIn: b.checkIn.toISOString().split('T')[0],
              checkOut: b.checkOut.toISOString().split('T')[0],
              guestsCount: b.guestsCount,
              preferredSuite: b.suiteId,
              suiteName: b.suite ? b.suite.name : 'DAR',
              pricePerNight: b.pricePerNight,
              totalNights: b.totalNights,
              totalEstimatedPrice: b.totalEstimatedPrice,
              specialRequests: b.specialRequests || '',
              status: b.status,
              createdAt: b.createdAt.toISOString(),
            })),
          };
        }
      } catch (err) {
        if (err instanceof ApiError) throw err;
      }
    }

    const fallback = this.fallbackGuests.find((g) => g.id === id || g.email === id);
    if (!fallback) {
      throw new ApiError(404, `Guest profile '${id}' not found`);
    }

    return fallback;
  }

  public async updateGuestProfile(
    id: string,
    data: { vipStatus?: boolean; phone?: string; country?: string; fullName?: string }
  ): Promise<GuestProfileWithHistory> {
    try {
      const existing = await prisma.guest.findFirst({
        where: { OR: [{ id }, { email: id }] },
      });

      if (existing) {
        const updated = await prisma.guest.update({
          where: { id: existing.id },
          data: {
            ...(data.vipStatus !== undefined && { vipStatus: data.vipStatus }),
            ...(data.phone && { phone: data.phone }),
            ...(data.country && { country: data.country }),
            ...(data.fullName && { fullName: data.fullName }),
          },
          include: {
            bookings: {
              include: { suite: true },
              orderBy: { createdAt: 'desc' },
            },
          },
        });

        const totalSpend = updated.bookings.reduce((sum, b) => sum + (b.totalEstimatedPrice || 0), 0);
        return {
          id: updated.id,
          fullName: updated.fullName,
          email: updated.email,
          phone: updated.phone,
          country: updated.country || 'The Gambia',
          vipStatus: updated.vipStatus,
          totalBookings: updated.totalBookings || updated.bookings.length,
          totalSpend,
          createdAt: updated.createdAt.toISOString(),
          bookings: updated.bookings.map((b) => ({
            id: b.id,
            bookingReference: b.bookingReference,
            fullName: b.fullName,
            email: b.email,
            phone: b.phone,
            checkIn: b.checkIn.toISOString().split('T')[0],
            checkOut: b.checkOut.toISOString().split('T')[0],
            guestsCount: b.guestsCount,
            preferredSuite: b.suiteId,
            suiteName: b.suite ? b.suite.name : 'DAR',
            pricePerNight: b.pricePerNight,
            totalNights: b.totalNights,
            totalEstimatedPrice: b.totalEstimatedPrice,
            specialRequests: b.specialRequests || '',
            status: b.status,
            createdAt: b.createdAt.toISOString(),
          })),
        };
      }
    } catch (err) {
      console.warn('[GUEST SERVICE] Prisma update failed, modifying fallback:', (err as Error).message);
    }

    const idx = this.fallbackGuests.findIndex((g) => g.id === id || g.email === id);
    if (idx !== -1) {
      if (data.vipStatus !== undefined) this.fallbackGuests[idx].vipStatus = data.vipStatus;
      if (data.phone) this.fallbackGuests[idx].phone = data.phone;
      if (data.country) this.fallbackGuests[idx].country = data.country;
      if (data.fullName) this.fallbackGuests[idx].fullName = data.fullName;
      return this.fallbackGuests[idx];
    }

    throw new ApiError(404, `Guest profile '${id}' not found`);
  }

  public async updateSpecialRequests(bookingId: string, specialRequests: string): Promise<BookingRecord> {
    try {
      const existing = await prisma.booking.findFirst({
        where: { OR: [{ id: bookingId }, { bookingReference: bookingId }] },
        include: { suite: true },
      });

      if (existing) {
        const updated = await prisma.booking.update({
          where: { id: existing.id },
          data: { specialRequests },
          include: { suite: true, payment: true, accessCard: true },
        });

        return {
          id: updated.id,
          bookingReference: updated.bookingReference,
          fullName: updated.fullName,
          email: updated.email,
          phone: updated.phone,
          checkIn: updated.checkIn.toISOString().split('T')[0],
          checkOut: updated.checkOut.toISOString().split('T')[0],
          guestsCount: updated.guestsCount,
          preferredSuite: updated.suiteId,
          suiteName: updated.suite ? updated.suite.name : 'DAR',
          pricePerNight: updated.pricePerNight,
          totalNights: updated.totalNights,
          totalEstimatedPrice: updated.totalEstimatedPrice,
          specialRequests: updated.specialRequests || '',
          status: updated.status,
          createdAt: updated.createdAt.toISOString(),
        };
      }
    } catch (err) {
      console.warn('[GUEST SERVICE] Prisma special request update failed:', (err as Error).message);
    }

    for (const guest of this.fallbackGuests) {
      const bIdx = guest.bookings.findIndex((b) => b.id === bookingId || b.bookingReference === bookingId);
      if (bIdx !== -1) {
        guest.bookings[bIdx].specialRequests = specialRequests;
        return guest.bookings[bIdx];
      }
    }

    throw new ApiError(404, `Booking '${bookingId}' not found`);
  }
}

export const guestService = new GuestService();
