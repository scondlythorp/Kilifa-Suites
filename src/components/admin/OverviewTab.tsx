import React from 'react';
import {
  Calendar,
  Clock,
  LogIn,
  LogOut,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Building,
  Users,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';

interface OverviewTabProps {
  stats: {
    todaysBookings: number;
    upcomingBookings: number;
    checkInsToday: number;
    checkOutsToday: number;
    occupancyRate: number;
    totalRevenue: number;
    pendingRequestsCount: number;
    totalSuites: number;
    totalGuests: number;
  };
  bookings: any[];
  onUpdateStatus: (id: string, status: string) => Promise<void>;
  onNavigateToBookings: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  stats,
  bookings,
  onUpdateStatus,
  onNavigateToBookings,
}) => {
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const recentBookings = bookings.slice(0, 6);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'CHECKED_IN':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'CHECKED_OUT':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* High-level KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Bookings */}
        <div className="bg-[#131A2E] border border-white/10 rounded-2xl p-5 hover:border-[#C5A059]/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-white/50 uppercase tracking-wider">
              Today's Bookings
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif text-white font-bold">{stats.todaysBookings}</div>
          <p className="text-xs text-white/50 mt-1">Bookings scheduled or requested today</p>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-[#131A2E] border border-white/10 rounded-2xl p-5 hover:border-[#C5A059]/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-white/50 uppercase tracking-wider">
              Upcoming Bookings
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif text-white font-bold">{stats.upcomingBookings}</div>
          <p className="text-xs text-white/50 mt-1">Future confirmed arrivals</p>
        </div>

        {/* Check-Ins Today */}
        <div className="bg-[#131A2E] border border-white/10 rounded-2xl p-5 hover:border-[#C5A059]/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-white/50 uppercase tracking-wider">
              Check-Ins Today
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <LogIn className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif text-white font-bold">{stats.checkInsToday}</div>
          <p className="text-xs text-emerald-400/80 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Guests arriving today
          </p>
        </div>

        {/* Check-Outs Today */}
        <div className="bg-[#131A2E] border border-white/10 rounded-2xl p-5 hover:border-[#C5A059]/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-white/50 uppercase tracking-wider">
              Check-Outs Today
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <LogOut className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif text-white font-bold">{stats.checkOutsToday}</div>
          <p className="text-xs text-white/50 mt-1">Departures scheduled today</p>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-[#131A2E] border border-white/10 rounded-2xl p-5 hover:border-[#C5A059]/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-white/50 uppercase tracking-wider">
              Suite Occupancy
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif text-[#C5A059] font-bold">
            {stats.occupancyRate}%
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#C5A059] h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.occupancyRate}%` }}
            />
          </div>
          <p className="text-[11px] text-white/50 mt-1">Based on {stats.totalSuites} total luxury suites</p>
        </div>

        {/* Revenue */}
        <div className="bg-[#131A2E] border border-white/10 rounded-2xl p-5 hover:border-[#C5A059]/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-white/50 uppercase tracking-wider">
              Gross Revenue
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif text-emerald-400 font-bold">
            ${stats.totalRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-emerald-400/80 mt-1">Confirmed & checked-in total</p>
        </div>

        {/* Pending Requests */}
        <div className="bg-[#131A2E] border border-white/10 rounded-2xl p-5 hover:border-[#C5A059]/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-white/50 uppercase tracking-wider">
              Pending Requests
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif text-amber-400 font-bold">
            {stats.pendingRequestsCount}
          </div>
          <p className="text-xs text-amber-400/80 mt-1">Awaiting staff confirmation</p>
        </div>

        {/* Total Guest Profiles */}
        <div className="bg-[#131A2E] border border-white/10 rounded-2xl p-5 hover:border-[#C5A059]/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-white/50 uppercase tracking-wider">
              Total Guest Profiles
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif text-white font-bold">{stats.totalGuests}</div>
          <p className="text-xs text-white/50 mt-1">Registered guests in system</p>
        </div>
      </div>

      {/* Pending Booking Requests Section */}
      {pendingBookings.length > 0 && (
        <div className="bg-[#131A2E] border border-amber-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-serif text-white font-semibold">
                Pending Booking Requests requiring Action ({pendingBookings.length})
              </h2>
            </div>
            <button
              onClick={onNavigateToBookings}
              className="text-xs text-[#C5A059] hover:underline flex items-center gap-1"
            >
              Manage all bookings <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/50 font-mono">
                  <th className="pb-3 font-normal">REF</th>
                  <th className="pb-3 font-normal">GUEST</th>
                  <th className="pb-3 font-normal">SUITE</th>
                  <th className="pb-3 font-normal">DATES</th>
                  <th className="pb-3 font-normal">GUESTS</th>
                  <th className="pb-3 font-normal">PRICE</th>
                  <th className="pb-3 text-right font-normal">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pendingBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/5 transition-all">
                    <td className="py-3 font-mono font-bold text-[#C5A059]">{b.bookingReference}</td>
                    <td className="py-3 font-medium text-white">{b.fullName}</td>
                    <td className="py-3 text-white/80">{b.suiteName}</td>
                    <td className="py-3 text-white/70 font-mono">
                      {b.checkIn} to {b.checkOut} ({b.totalNights}n)
                    </td>
                    <td className="py-3 text-white/70">{b.guestsCount}</td>
                    <td className="py-3 font-semibold text-emerald-400">${b.totalEstimatedPrice}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onUpdateStatus(b.id, 'CONFIRMED')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 font-medium transition-all flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
                        </button>
                        <button
                          onClick={() => onUpdateStatus(b.id, 'CANCELLED')}
                          className="px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all"
                          title="Reject / Cancel"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Activity Table */}
      <div className="bg-[#131A2E] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif text-white font-semibold">Recent Booking Activity</h2>
          <button
            onClick={onNavigateToBookings}
            className="text-xs text-[#C5A059] hover:underline flex items-center gap-1"
          >
            View all bookings <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/50 font-mono">
                <th className="pb-3 font-normal">REF</th>
                <th className="pb-3 font-normal">GUEST</th>
                <th className="pb-3 font-normal">SUITE</th>
                <th className="pb-3 font-normal">CHECK-IN</th>
                <th className="pb-3 font-normal">CHECK-OUT</th>
                <th className="pb-3 font-normal">STATUS</th>
                <th className="pb-3 text-right font-normal">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-white/5 transition-all">
                  <td className="py-3 font-mono text-[#C5A059] font-bold">{b.bookingReference}</td>
                  <td className="py-3 text-white font-medium">{b.fullName}</td>
                  <td className="py-3 text-white/80">{b.suiteName}</td>
                  <td className="py-3 text-white/70 font-mono">{b.checkIn}</td>
                  <td className="py-3 text-white/70 font-mono">{b.checkOut}</td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider border font-bold ${getStatusBadge(
                        b.status
                      )}`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 text-right font-bold text-emerald-400">
                    ${b.totalEstimatedPrice}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
