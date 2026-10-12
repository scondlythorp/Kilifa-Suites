import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClient';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  Hotel,
  Download,
  Printer,
  RefreshCw,
  PieChart as PieIcon,
  BarChart3,
  Globe,
  CreditCard,
  Building2,
  CheckCircle2,
  CalendarRange,
  ArrowUpRight,
} from 'lucide-react';
import { formatGMD } from '../../utils/currency';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const AnalyticsTab: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<'30d' | '90d' | 'year' | 'all'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await api.analytics.getReport(timeframe);
      if (res?.data) {
        setReport(res.data);
      }
    } catch (err) {
      console.warn('[ANALYTICS TAB] Failed to fetch analytics report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const handleExportCSV = () => {
    if (!report) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'KILIFA SUITES — MANAGEMENT ANALYTICS & EXECUTIVE REPORT\n';
    csvContent += `Generated At: ${new Date().toLocaleString()}\n`;
    csvContent += `Timeframe Filter: ${timeframe.toUpperCase()}\n\n`;

    // 1. KPI Summary
    csvContent += '--- OVERVIEW METRICS ---\n';
    csvContent += `Occupancy Rate (%),Occupied Suites,Available Suites,Total Suites,ADR (GMD),RevPAR (GMD)\n`;
    csvContent += `${report.occupancy.rate}%,${report.occupancy.occupiedSuites},${report.occupancy.availableSuites},${report.occupancy.totalSuites},${report.occupancy.adr},${report.occupancy.revpar}\n\n`;

    csvContent += `Total Revenue (GMD),Paid Revenue (GMD),Pending Revenue (GMD),Total Bookings,Average Length of Stay (Nights)\n`;
    csvContent += `${report.revenue.totalRevenue},${report.revenue.paidRevenue},${report.revenue.pendingRevenue},${report.bookingVolume.totalBookings},${report.bookingVolume.averageLengthOfStay}\n\n`;

    // 2. Most Booked Suites
    csvContent += '--- MOST BOOKED SUITES ---\n';
    csvContent += 'Suite Name,House Number,Booking Count,Total Nights Booked,Revenue (GMD),Occupancy Share (%)\n';
    report.mostBookedSuites.forEach((s: any) => {
      csvContent += `"${s.suiteName}",House ${s.houseNumber},${s.bookingCount},${s.totalNights},${s.revenue},${s.occupancyShare}%\n`;
    });
    csvContent += '\n';

    // 3. Guest Origins
    csvContent += '--- GUEST ORIGINS ---\n';
    csvContent += 'Country,Guest Count,Booking Count,Distribution (%)\n';
    report.guestOrigins.forEach((g: any) => {
      csvContent += `"${g.country}",${g.guestCount},${g.bookingCount},${g.percentage}%\n`;
    });
    csvContent += '\n';

    // 4. Payment Methods
    csvContent += '--- PAYMENT METHODS ---\n';
    csvContent += 'Payment Method,Transaction Count,Total Amount (GMD),Share (%)\n';
    report.paymentMethods.forEach((p: any) => {
      csvContent += `"${p.label}",${p.count},D ${p.totalAmount},${p.percentage}%\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kilifa_suites_analytics_report_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportFeedback('CSV Management Report downloaded successfully!');
    setTimeout(() => setExportFeedback(null), 4000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const PIE_COLORS = ['#C5A059', '#38BDF8', '#34D399', '#FBBF24', '#A78BFA', '#F472B6', '#F87171', '#818CF8'];

  if (isLoading && !report) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/50 space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-[#C5A059]" />
        <p className="text-xs font-mono">Generating Management Analytics & Reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn print:bg-white print:text-black">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#0F172A] border border-amber-500/20 shadow-xl print:border-none print:bg-none print:p-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-white tracking-wide">
              Management Analytics & Reports
            </h2>
            <p className="text-xs text-white/60 font-mono mt-0.5">
              Live Financial Intelligence &bull; PostgreSQL REST API Data &bull; Executive Reports
            </p>
          </div>
        </div>

        {/* Controls: Timeframe Filter + Export Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 print:hidden">
          {/* Timeframe Filter */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 text-xs font-mono">
            {(['30d', '90d', 'year', 'all'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeframe === tf
                    ? 'bg-[#C5A059] text-black font-bold shadow'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {tf === '30d' ? '30 Days' : tf === '90d' ? '90 Days' : tf === 'year' ? '1 Year' : 'All Time'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-mono border border-emerald-500/30 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-mono border border-white/10 transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {exportFeedback && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{exportFeedback}</span>
        </div>
      )}

      {/* KPI Overview Grid */}
      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Occupancy Rate */}
          <div className="p-5 rounded-2xl bg-[#0B101D] border border-white/10 relative overflow-hidden group hover:border-[#C5A059]/40 transition-all">
            <div className="flex items-center justify-between text-white/50 mb-2 text-xs font-mono">
              <span>SUITE OCCUPANCY</span>
              <Hotel className="w-4 h-4 text-[#C5A059]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-white">{report.occupancy.rate}%</span>
              <span className="text-xs font-mono text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> Live
              </span>
            </div>
            <p className="text-[11px] text-white/40 mt-2 font-mono">
              {report.occupancy.occupiedSuites} occupied / {report.occupancy.availableSuites} available of {report.occupancy.totalSuites}
            </p>
          </div>

          {/* Revenue Total */}
          <div className="p-5 rounded-2xl bg-[#0B101D] border border-white/10 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-white/50 mb-2 text-xs font-mono">
              <span>TOTAL REVENUE</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-white">
                {formatGMD(report.revenue.totalRevenue)}
              </span>
            </div>
            <p className="text-[11px] text-emerald-400/80 mt-2 font-mono">
              Paid: {formatGMD(report.revenue.paidRevenue)} | Pending: {formatGMD(report.revenue.pendingRevenue)}
            </p>
          </div>

          {/* ADR & RevPAR */}
          <div className="p-5 rounded-2xl bg-[#0B101D] border border-white/10 relative overflow-hidden group hover:border-sky-500/40 transition-all">
            <div className="flex items-center justify-between text-white/50 mb-2 text-xs font-mono">
              <span>ADR / RevPAR</span>
              <TrendingUp className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-3">
              <div>
                <span className="text-2xl font-serif font-bold text-white">{formatGMD(report.occupancy.adr)}</span>
                <span className="text-[10px] text-white/40 block font-mono">ADR</span>
              </div>
              <div className="border-l border-white/10 pl-3">
                <span className="text-2xl font-serif font-bold text-sky-300">{formatGMD(report.occupancy.revpar)}</span>
                <span className="text-[10px] text-white/40 block font-mono">RevPAR</span>
              </div>
            </div>
          </div>

          {/* Booking Volume & Avg Stay */}
          <div className="p-5 rounded-2xl bg-[#0B101D] border border-white/10 relative overflow-hidden group hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between text-white/50 mb-2 text-xs font-mono">
              <span>BOOKING VOLUME</span>
              <Calendar className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-white">
                {report.bookingVolume.totalBookings}
              </span>
              <span className="text-xs font-mono text-white/50">Reservations</span>
            </div>
            <p className="text-[11px] text-white/40 mt-2 font-mono">
              Avg Stay: {report.bookingVolume.averageLengthOfStay} nights &bull; Avg Value: {formatGMD(report.revenue.averageBookingValue)}
            </p>
          </div>
        </div>
      )}

      {/* Main Charts Grid: Monthly Revenue & Booking Trends */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Monthly Revenue Chart */}
          <div className="lg:col-span-8 p-6 rounded-2xl bg-[#0B101D] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#C5A059]" />
                  Monthly Revenue Performance (GMD)
                </h3>
                <p className="text-xs text-white/50 mt-1">
                  12-Month historical revenue timeline derived from verified bookings.
                </p>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={report.monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C5A059" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#C5A059" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="month" stroke="#ffffff50" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#ffffff50" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }}
                    formatter={(val: any) => [formatGMD(Number(val)), 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#C5A059" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Guest Origins Breakdown */}
          <div className="lg:col-span-4 p-6 rounded-2xl bg-[#0B101D] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-400" />
                  Guest Demographics & Origins
                </h3>
                <p className="text-xs text-white/50 mt-1">Distribution of guest international origins.</p>
              </div>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {report.guestOrigins.map((g: any, i: number) => (
                <div key={g.country} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="font-semibold text-white">{g.country}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-white font-bold">{g.bookingCount} bookings</span>
                    <span className="text-white/40 block text-[10px]">{g.percentage}% share</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Secondary Grid: Payment Methods & Most Booked Suites */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Most Booked Suites */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0B101D] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <Hotel className="w-4 h-4 text-amber-400" />
                  Most Booked Suites & Yield Ranking
                </h3>
                <p className="text-xs text-white/50 mt-1">Performance ranking by reservation volume and revenue generated.</p>
              </div>
            </div>

            <div className="space-y-3">
              {report.mostBookedSuites.map((s: any) => (
                <div key={s.suiteId} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-semibold text-white text-sm">{s.suiteName}</h4>
                    <p className="text-white/40 font-mono text-[11px]">House {s.houseNumber} &bull; {s.bookingCount} Reservations &bull; {s.totalNights} Nights</p>
                  </div>
                  <div className="sm:text-right font-mono">
                    <span className="text-[#C5A059] font-bold text-sm">{formatGMD(s.revenue)}</span>
                    <span className="text-emerald-400/80 block text-[10px]">{s.occupancyShare}% of suite nights</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0B101D] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  Payment Methods & Gateways
                </h3>
                <p className="text-xs text-white/50 mt-1">Transaction volumes across Wave, AfriMoney, APS, Visa, and Cash.</p>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.paymentMethods} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis type="number" stroke="#ffffff50" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="label" type="category" stroke="#ffffff50" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }}
                    formatter={(val: any) => [formatGMD(Number(val)), 'Processed']}
                  />
                  <Bar dataKey="totalAmount" fill="#34D399" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tertiary Row: Check-in / Check-out Trends */}
      {report && (
        <div className="p-6 rounded-2xl bg-[#0B101D] border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                <CalendarRange className="w-4 h-4 text-purple-400" />
                Check-in vs Check-out Weekly Distribution
              </h3>
              <p className="text-xs text-white/50 mt-1">Guest arrival and departure frequency by day of the week.</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.checkInOutTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="dayOfWeek" stroke="#ffffff50" tick={{ fontSize: 11 }} />
                <YAxis stroke="#ffffff50" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="checkIns" name="Check-Ins (Arrivals)" fill="#38BDF8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="checkOuts" name="Check-Outs (Departures)" fill="#F472B6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
