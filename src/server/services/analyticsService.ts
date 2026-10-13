import { prisma, isDatabaseConnected } from '../db/prisma';
import { bookingService } from './bookingService';
import { suiteService } from './suiteService';
import { guestService } from './guestService';

export interface AnalyticsSummary {
  occupancy: {
    rate: number; // percentage
    occupiedSuites: number;
    availableSuites: number;
    totalSuites: number;
    adr: number; // Average Daily Rate (GMD)
    revpar: number; // Revenue Per Available Room (GMD)
  };
  revenue: {
    totalRevenue: number;
    paidRevenue: number;
    pendingRevenue: number;
    averageBookingValue: number;
  };
  bookingVolume: {
    totalBookings: number;
    confirmed: number;
    checkedIn: number;
    checkedOut: number;
    pending: number;
    cancelled: number;
    averageLengthOfStay: number; // nights
  };
  mostBookedSuites: Array<{
    suiteId: string;
    suiteName: string;
    houseNumber: number;
    bookingCount: number;
    totalNights: number;
    revenue: number;
    occupancyShare: number; // percentage
  }>;
  guestOrigins: Array<{
    country: string;
    guestCount: number;
    bookingCount: number;
    percentage: number;
  }>;
  paymentMethods: Array<{
    method: string;
    label: string;
    count: number;
    totalAmount: number;
    percentage: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    yearMonth: string; // e.g. "2026-08"
    revenue: number;
    bookingCount: number;
    occupancyRate: number;
  }>;
  bookingTrends: Array<{
    date: string; // "YYYY-MM-DD" or "Mon DD"
    bookingCount: number;
    revenue: number;
  }>;
  checkInOutTrends: Array<{
    dayOfWeek: string;
    checkIns: number;
    checkOuts: number;
  }>;
}

export class AnalyticsService {
  public async getAnalyticsReport(timeframe: '30d' | '90d' | 'year' | 'all' = 'all'): Promise<AnalyticsSummary> {
    let bookings: any[] = [];
    let suites: any[] = [];
    let guests: any[] = [];
    let payments: any[] = [];

    if (isDatabaseConnected()) {
      try {
        bookings = await prisma.booking.findMany({
          include: {
            suite: true,
            guest: true,
            payment: true,
          },
          orderBy: { createdAt: 'desc' },
        });

        suites = await prisma.suite.findMany({
          include: { house: true },
        });

        guests = await prisma.guest.findMany();
        payments = await prisma.payment.findMany();
      } catch (err) {
        // Fall back to in-memory services below
      }
    }

    if (suites.length === 0) {
      suites = await suiteService.getAllSuites();
    }
    if (bookings.length === 0) {
      const fallbackRecords = await bookingService.getAllBookings();
      bookings = fallbackRecords.map((b) => ({
        ...b,
        suiteId: b.preferredSuite || 'suite-101',
        suite: { name: b.suiteName, houseNumber: 1 },
        guest: { fullName: b.fullName, country: 'The Gambia' },
      }));
    }
    if (guests.length === 0) {
      guests = await guestService.getAllGuests();
    }

    const totalSuites = Math.max(1, suites.length);
    const todayStr = new Date().toISOString().split('T')[0];

    // Filter bookings based on timeframe if requested
    let filteredBookings = bookings;
    if (timeframe !== 'all') {
      const cutoff = new Date();
      if (timeframe === '30d') cutoff.setDate(cutoff.getDate() - 30);
      else if (timeframe === '90d') cutoff.setDate(cutoff.getDate() - 90);
      else if (timeframe === 'year') cutoff.setFullYear(cutoff.getFullYear() - 1);

      filteredBookings = bookings.filter((b) => new Date(b.createdAt) >= cutoff);
    }

    // 1. Occupancy & Metrics
    const activeOccupiedSuites = bookings.filter((b) => {
      const chIn = new Date(b.checkIn).toISOString().split('T')[0];
      const chOut = new Date(b.checkOut).toISOString().split('T')[0];
      return ['CONFIRMED', 'COMPLETED'].includes(b.status) && chIn <= todayStr && chOut >= todayStr;
    }).length;

    const occupancyRate = Math.min(100, Math.round((activeOccupiedSuites / totalSuites) * 100));

    // Valid revenue-generating bookings
    const validBookings = filteredBookings.filter((b) => b.status !== 'CANCELLED');
    const totalRev = validBookings.reduce((sum, b) => sum + (b.totalEstimatedPrice || 0), 0);
    const totalNightsBooked = validBookings.reduce((sum, b) => sum + (b.totalNights || 1), 0);

    const adr = totalNightsBooked > 0 ? Math.round(totalRev / totalNightsBooked) : 0;
    const revpar = Math.round(adr * (occupancyRate / 100));

    // 2. Revenue Breakdown
    let paidRev = 0;
    let pendingRev = 0;

    for (const b of filteredBookings) {
      if (b.status === 'CANCELLED') continue;
      if (b.payment && (b.payment.status === 'SUCCESSFUL' || b.payment.status === 'COMPLETED')) {
        paidRev += b.payment.paidAmount || b.totalEstimatedPrice;
      } else if (b.payment && b.payment.status === 'PARTIALLY_PAID') {
        paidRev += b.payment.paidAmount || 0;
        pendingRev += Math.max(0, b.totalEstimatedPrice - (b.payment.paidAmount || 0));
      } else {
        pendingRev += b.totalEstimatedPrice;
      }
    }

    const avgBookingValue = validBookings.length > 0 ? Math.round(totalRev / validBookings.length) : 0;

    // 3. Booking Volume & Status Breakdown
    const confirmedCount = filteredBookings.filter((b) => b.status === 'CONFIRMED').length;
    const completedCount = filteredBookings.filter((b) => b.status === 'COMPLETED').length;
    const pendingCount = filteredBookings.filter((b) => b.status === 'PENDING').length;
    const cancelledCount = filteredBookings.filter((b) => b.status === 'CANCELLED').length;

    const avgStay = validBookings.length > 0 ? parseFloat((totalNightsBooked / validBookings.length).toFixed(1)) : 0;

    // 4. Most Booked Suites
    const suiteStatsMap = new Map<
      string,
      { suiteName: string; houseNumber: number; count: number; nights: number; revenue: number }
    >();

    suites.forEach((s) => {
      suiteStatsMap.set(s.id, {
        suiteName: s.name,
        houseNumber: s.houseNumber,
        count: 0,
        nights: 0,
        revenue: 0,
      });
    });

    filteredBookings.forEach((b) => {
      if (b.status === 'CANCELLED') return;
      const stats = suiteStatsMap.get(b.suiteId);
      if (stats) {
        stats.count += 1;
        stats.nights += b.totalNights || 1;
        stats.revenue += b.totalEstimatedPrice || 0;
      }
    });

    const mostBookedSuites = Array.from(suiteStatsMap.entries())
      .map(([suiteId, val]) => ({
        suiteId,
        suiteName: val.suiteName,
        houseNumber: val.houseNumber,
        bookingCount: val.count,
        totalNights: val.nights,
        revenue: val.revenue,
        occupancyShare: totalNightsBooked > 0 ? Math.round((val.nights / totalNightsBooked) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // 5. Guest Origins
    const countryMap = new Map<string, { guestCount: Set<string>; bookingCount: number }>();

    filteredBookings.forEach((b) => {
      const country = b.guest?.country || 'The Gambia';
      if (!countryMap.has(country)) {
        countryMap.set(country, { guestCount: new Set(), bookingCount: 0 });
      }
      const entry = countryMap.get(country)!;
      if (b.guestId) entry.guestCount.add(b.guestId);
      else entry.guestCount.add(b.email);
      entry.bookingCount += 1;
    });

    const totalOriginBookings = Math.max(1, filteredBookings.length);
    const guestOrigins = Array.from(countryMap.entries())
      .map(([country, val]) => ({
        country,
        guestCount: val.guestCount.size,
        bookingCount: val.bookingCount,
        percentage: Math.round((val.bookingCount / totalOriginBookings) * 100),
      }))
      .sort((a, b) => b.bookingCount - a.bookingCount);

    // 6. Payment Methods
    const methodLabels: Record<string, string> = {
      WAVE: 'Wave Mobile Money',
      AFRIMONEY: 'AfriMoney',
      APS_WALLET: 'APS International Wallet',
      VISA_CARD: 'Visa Card',
      PAYPAL: 'PayPal',
      CASH: 'Cash at Desk',
      BANK_TRANSFER: 'Direct Bank Transfer',
      CREDIT_CARD: 'Credit / Debit Card',
      MOBILE_MONEY: 'Mobile Money',
    };

    const methodMap = new Map<string, { count: number; total: number }>();

    payments.forEach((p) => {
      const methodKey = p.method || 'CASH';
      if (!methodMap.has(methodKey)) {
        methodMap.set(methodKey, { count: 0, total: 0 });
      }
      const item = methodMap.get(methodKey)!;
      item.count += 1;
      item.total += p.amount || 0;
    });

    const totalPaymentsCount = Math.max(1, payments.length);
    const paymentMethods = Array.from(methodMap.entries())
      .map(([method, val]) => ({
        method,
        label: methodLabels[method] || method,
        count: val.count,
        totalAmount: val.total,
        percentage: Math.round((val.count / totalPaymentsCount) * 100),
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    // 7. Monthly Revenue Trends (12 Months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = new Map<string, { monthName: string; revenue: number; count: number }>();

    // Seed last 6-12 months
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const name = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthlyMap.set(ym, { monthName: name, revenue: 0, count: 0 });
    }

    filteredBookings.forEach((b) => {
      if (b.status === 'CANCELLED') return;
      const bDate = new Date(b.createdAt);
      const ym = `${bDate.getFullYear()}-${String(bDate.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap.has(ym)) {
        const item = monthlyMap.get(ym)!;
        item.revenue += b.totalEstimatedPrice || 0;
        item.count += 1;
      }
    });

    const monthlyRevenue = Array.from(monthlyMap.entries()).map(([ym, val]) => ({
      month: val.monthName,
      yearMonth: ym,
      revenue: val.revenue,
      bookingCount: val.count,
      occupancyRate: Math.min(100, Math.round((val.count / (totalSuites * 30)) * 100)),
    }));

    // 8. Booking Trends (Recent days / timeline)
    const trendMap = new Map<string, { count: number; revenue: number }>();
    for (let i = 14; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      trendMap.set(dateStr, { count: 0, revenue: 0 });
    }

    filteredBookings.forEach((b) => {
      const dateStr = new Date(b.createdAt).toISOString().split('T')[0];
      if (trendMap.has(dateStr)) {
        const item = trendMap.get(dateStr)!;
        item.count += 1;
        if (b.status !== 'CANCELLED') {
          item.revenue += b.totalEstimatedPrice || 0;
        }
      }
    });

    const bookingTrends = Array.from(trendMap.entries()).map(([dateStr, val]) => {
      const d = new Date(dateStr);
      const label = `${monthNames[d.getMonth()]} ${d.getDate()}`;
      return {
        date: label,
        bookingCount: val.count,
        revenue: val.revenue,
      };
    });

    // 9. Check-in / Check-out Trends by Day of Week
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysMap = new Map<string, { checkIns: number; checkOuts: number }>();
    days.forEach((day) => daysMap.set(day, { checkIns: 0, checkOuts: 0 }));

    filteredBookings.forEach((b) => {
      if (b.status === 'CANCELLED') return;
      const inDay = days[new Date(b.checkIn).getDay()];
      const outDay = days[new Date(b.checkOut).getDay()];

      if (daysMap.has(inDay)) daysMap.get(inDay)!.checkIns += 1;
      if (daysMap.has(outDay)) daysMap.get(outDay)!.checkOuts += 1;
    });

    const checkInOutTrends = Array.from(daysMap.entries()).map(([dayOfWeek, val]) => ({
      dayOfWeek,
      checkIns: val.checkIns,
      checkOuts: val.checkOuts,
    }));

    return {
      occupancy: {
        rate: occupancyRate,
        occupiedSuites: activeOccupiedSuites,
        availableSuites: Math.max(0, totalSuites - activeOccupiedSuites),
        totalSuites,
        adr,
        revpar,
      },
      revenue: {
        totalRevenue: totalRev,
        paidRevenue: paidRev,
        pendingRevenue: pendingRev,
        averageBookingValue: avgBookingValue,
      },
      bookingVolume: {
        totalBookings: filteredBookings.length,
        confirmed: confirmedCount,
        checkedIn: activeOccupiedSuites,
        checkedOut: completedCount,
        pending: pendingCount,
        cancelled: cancelledCount,
        averageLengthOfStay: avgStay,
      },
      mostBookedSuites,
      guestOrigins,
      paymentMethods,
      monthlyRevenue,
      bookingTrends,
      checkInOutTrends,
    };
  }
}

export const analyticsService = new AnalyticsService();
