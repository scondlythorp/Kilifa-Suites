import { bookingService } from './bookingService';
import { suiteService } from './suiteService';
import { guestService } from './guestService';

export interface DashboardStats {
  todaysBookings: number;
  upcomingBookings: number;
  checkInsToday: number;
  checkOutsToday: number;
  occupancyRate: number; // percentage e.g. 75
  totalRevenue: number;
  pendingRequestsCount: number;
  totalSuites: number;
  activeSuites: number;
  totalGuests: number;
}

class DashboardService {
  public async getDashboardStats(): Promise<DashboardStats> {
    const bookings = await bookingService.getAllBookings();
    const suites = await suiteService.getAllSuites();
    const guests = await guestService.getAllGuests();

    const todayStr = new Date().toISOString().split('T')[0];

    // Today's bookings (created or checkIn today)
    const todaysBookings = bookings.filter((b) => b.createdAt.startsWith(todayStr) || b.checkIn === todayStr).length;

    // Upcoming bookings (checkIn > today & status != CANCELLED)
    const upcomingBookings = bookings.filter((b) => b.checkIn > todayStr && b.status !== 'CANCELLED').length;

    // Check-ins today
    const checkInsToday = bookings.filter((b) => b.checkIn === todayStr && b.status !== 'CANCELLED').length;

    // Check-outs today
    const checkOutsToday = bookings.filter((b) => b.checkOut === todayStr && b.status !== 'CANCELLED').length;

    // Active occupancy count (status CHECKED_IN or CONFIRMED overlapping today)
    const occupiedSuites = bookings.filter(
      (b) => (b.status === 'CHECKED_IN' || b.status === 'CONFIRMED') && b.checkIn <= todayStr && b.checkOut >= todayStr
    ).length;

    const totalSuites = Math.max(1, suites.length);
    const occupancyRate = Math.min(100, Math.round((occupiedSuites / totalSuites) * 100));

    // Revenue calculation (from confirmed / checked_in / checked_out bookings)
    const totalRevenue = bookings
      .filter((b) => ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'].includes(b.status))
      .reduce((sum, b) => sum + (b.totalEstimatedPrice || 0), 0);

    // Pending requests
    const pendingRequestsCount = bookings.filter((b) => b.status === 'PENDING').length;

    return {
      todaysBookings,
      upcomingBookings,
      checkInsToday,
      checkOutsToday,
      occupancyRate,
      totalRevenue,
      pendingRequestsCount,
      totalSuites,
      activeSuites: totalSuites,
      totalGuests: guests.length,
    };
  }
}

export const dashboardService = new DashboardService();
