import React, { useState } from 'react';
import {
  Users,
  Search,
  Crown,
  Calendar,
  Globe,
  Phone,
  Mail,
  History,
  CheckCircle2,
  X,
  ChevronRight,
  Shield,
  ShieldOff,
  Edit3,
  LogIn,
  LogOut,
  Key,
  Sparkles,
  DollarSign,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  MessageSquare,
  Check,
  UserCheck,
  Building2,
} from 'lucide-react';
import { formatGMD } from '../../utils/currency';

interface GuestsTabProps {
  guests: any[];
  onUpdateProfile?: (id: string, data: any) => Promise<void>;
  onCheckIn?: (bookingId: string) => Promise<void>;
  onCheckOut?: (bookingId: string) => Promise<void>;
  onUpdateSpecialRequests?: (bookingId: string, specialRequests: string) => Promise<void>;
}

export const GuestsTab: React.FC<GuestsTabProps> = ({
  guests,
  onUpdateProfile,
  onCheckIn,
  onCheckOut,
  onUpdateSpecialRequests,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVipFilter, setSelectedVipFilter] = useState<'ALL' | 'VIP' | 'STANDARD'>('ALL');
  const [selectedStayFilter, setSelectedStayFilter] = useState<'ALL' | 'IN_HOUSE' | 'UPCOMING' | 'COMPLETED'>('ALL');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<'ALL' | 'GAMBIA' | 'INTERNATIONAL'>('ALL');
  const [sortBy, setSortBy] = useState<'MOST_BOOKINGS' | 'HIGHEST_SPEND' | 'NAME_ASC' | 'RECENT'>('MOST_BOOKINGS');
  
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isPrivacyProtected, setIsPrivacyProtected] = useState<boolean>(true);

  // Selected Guest Modal State
  const [selectedGuest, setSelectedGuest] = useState<any | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'overview' | 'history' | 'requests' | 'cards'>('overview');
  
  // Inline edit state inside modal
  const [editingSpecialRequestBooking, setEditingSpecialRequestBooking] = useState<{ id: string; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sensitive Data Protection Masking Helper
  const maskValue = (val: string, type: 'email' | 'phone') => {
    if (!isPrivacyProtected || !val) return val;
    if (type === 'email') {
      const [user, domain] = val.split('@');
      if (!domain) return '••••••••';
      return `${user.substring(0, 2)}••••@${domain}`;
    }
    return `${val.substring(0, 4)}••••${val.substring(val.length - 2)}`;
  };

  // Helper metrics
  const totalGuests = guests.length;
  const inHouseGuests = guests.filter((g) =>
    g.bookings?.some((b: any) => b.status === 'CHECKED_IN')
  ).length;
  const vipCount = guests.filter((g) => g.vipStatus).length;
  const totalLifetimeSpend = guests.reduce((sum, g) => {
    const guestSpend = g.totalSpend || g.bookings?.reduce((bSum: number, b: any) => bSum + (b.totalEstimatedPrice || 0), 0) || 0;
    return sum + guestSpend;
  }, 0);

  // Filtering & Search logic
  const filteredGuests = guests
    .filter((g) => {
      // Search match
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        g.fullName.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.phone.includes(q) ||
        (g.country && g.country.toLowerCase().includes(q)) ||
        g.bookings?.some(
          (b: any) =>
            b.bookingReference.toLowerCase().includes(q) ||
            (b.suiteName && b.suiteName.toLowerCase().includes(q))
        );

      // VIP Filter
      const matchesVip =
        selectedVipFilter === 'ALL' ||
        (selectedVipFilter === 'VIP' && g.vipStatus) ||
        (selectedVipFilter === 'STANDARD' && !g.vipStatus);

      // Stay Status Filter
      let matchesStay = true;
      if (selectedStayFilter === 'IN_HOUSE') {
        matchesStay = g.bookings?.some((b: any) => b.status === 'CHECKED_IN');
      } else if (selectedStayFilter === 'UPCOMING') {
        matchesStay = g.bookings?.some((b: any) => b.status === 'CONFIRMED' || b.status === 'PENDING');
      } else if (selectedStayFilter === 'COMPLETED') {
        matchesStay = g.bookings?.some((b: any) => b.status === 'CHECKED_OUT' || b.status === 'COMPLETED');
      }

      // Country Filter
      let matchesCountry = true;
      if (selectedCountryFilter === 'GAMBIA') {
        matchesCountry = !g.country || g.country.toLowerCase().includes('gambia');
      } else if (selectedCountryFilter === 'INTERNATIONAL') {
        matchesCountry = g.country && !g.country.toLowerCase().includes('gambia');
      }

      return matchesSearch && matchesVip && matchesStay && matchesCountry;
    })
    .sort((a, b) => {
      if (sortBy === 'MOST_BOOKINGS') {
        return (b.totalBookings || b.bookings?.length || 0) - (a.totalBookings || a.bookings?.length || 0);
      }
      if (sortBy === 'HIGHEST_SPEND') {
        const spendA = a.totalSpend || a.bookings?.reduce((s: number, bk: any) => s + (bk.totalEstimatedPrice || 0), 0) || 0;
        const spendB = b.totalSpend || b.bookings?.reduce((s: number, bk: any) => s + (bk.totalEstimatedPrice || 0), 0) || 0;
        return spendB - spendA;
      }
      if (sortBy === 'NAME_ASC') {
        return a.fullName.localeCompare(b.fullName);
      }
      if (sortBy === 'RECENT') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      return 0;
    });

  // Action Handlers
  const handleToggleVip = async (guest: any) => {
    if (!onUpdateProfile) return;
    try {
      setIsSaving(true);
      await onUpdateProfile(guest.id, { vipStatus: !guest.vipStatus });
      if (selectedGuest && selectedGuest.id === guest.id) {
        setSelectedGuest({ ...selectedGuest, vipStatus: !selectedGuest.vipStatus });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleActionCheckIn = async (bookingId: string) => {
    if (!onCheckIn) return;
    try {
      setIsSaving(true);
      await onCheckIn(bookingId);
      if (selectedGuest) {
        const updatedBookings = selectedGuest.bookings.map((b: any) =>
          b.id === bookingId || b.bookingReference === bookingId
            ? { ...b, status: 'CHECKED_IN' }
            : b
        );
        setSelectedGuest({ ...selectedGuest, bookings: updatedBookings });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleActionCheckOut = async (bookingId: string) => {
    if (!onCheckOut) return;
    try {
      setIsSaving(true);
      await onCheckOut(bookingId);
      if (selectedGuest) {
        const updatedBookings = selectedGuest.bookings.map((b: any) =>
          b.id === bookingId || b.bookingReference === bookingId
            ? { ...b, status: 'CHECKED_OUT' }
            : b
        );
        setSelectedGuest({ ...selectedGuest, bookings: updatedBookings });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSpecialRequests = async () => {
    if (!editingSpecialRequestBooking || !onUpdateSpecialRequests) return;
    try {
      setIsSaving(true);
      await onUpdateSpecialRequests(editingSpecialRequestBooking.id, editingSpecialRequestBooking.text);
      if (selectedGuest) {
        const updatedBookings = selectedGuest.bookings.map((b: any) =>
          b.id === editingSpecialRequestBooking.id || b.bookingReference === editingSpecialRequestBooking.id
            ? { ...b, specialRequests: editingSpecialRequestBooking.text }
            : b
        );
        setSelectedGuest({ ...selectedGuest, bookings: updatedBookings });
      }
      setEditingSpecialRequestBooking(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#131A2E] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">
              Total Guest Profiles
            </span>
            <div className="text-2xl font-serif font-bold text-white mt-1">{totalGuests}</div>
            <div className="text-[10px] text-emerald-400 font-mono mt-1">
              Registered in Kilifa CRM
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#131A2E] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">
              Currently In-House
            </span>
            <div className="text-2xl font-serif font-bold text-blue-400 mt-1">{inHouseGuests}</div>
            <div className="text-[10px] text-blue-400/80 font-mono mt-1">
              Active Stay Reservations
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#131A2E] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">
              VIP Tier Guests
            </span>
            <div className="text-2xl font-serif font-bold text-amber-400 mt-1">{vipCount}</div>
            <div className="text-[10px] text-amber-400/80 font-mono mt-1">
              Priority Luxury Status
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Crown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#131A2E] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">
              Lifetime Guest Value
            </span>
            <div className="text-2xl font-serif font-bold text-emerald-400 mt-1">
              {formatGMD(totalLifetimeSpend)}
            </div>
            <div className="text-[10px] text-emerald-400/80 font-mono mt-1">
              Cumulative Booking Revenue
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Header & Search Bar */}
      <div className="bg-[#131A2E] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-serif text-white font-semibold">Guest Directory & CRM Management</h2>
            <p className="text-xs text-white/50 mt-0.5">
              Comprehensive guest stay history, check-in/out status, special requests, and sensitive data protection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Privacy Shield Toggle Button */}
            <button
              onClick={() => setIsPrivacyProtected(!isPrivacyProtected)}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-medium border transition-all flex items-center gap-2 ${
                isPrivacyProtected
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}
              title={isPrivacyProtected ? 'Privacy Shield Active (Masked PII)' : 'Privacy Shield Inactive (Unmasked PII)'}
            >
              {isPrivacyProtected ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
              <span className="hidden sm:inline">
                {isPrivacyProtected ? 'Privacy Shield ON' : 'Privacy Shield OFF'}
              </span>
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewMode === 'grid' ? 'bg-[#C5A059] text-black font-bold' : 'text-white/50 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewMode === 'table' ? 'bg-[#C5A059] text-black font-bold' : 'text-white/50 hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-white/10">
          {/* Search Box */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, email, phone, reference, country..."
              className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:border-[#C5A059] focus:outline-none"
            />
          </div>

          {/* VIP Filter Dropdown */}
          <select
            value={selectedVipFilter}
            onChange={(e: any) => setSelectedVipFilter(e.target.value)}
            className="py-2 px-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white/80 focus:border-[#C5A059] focus:outline-none"
          >
            <option value="ALL">All VIP Tiers</option>
            <option value="VIP">VIP Guests Only</option>
            <option value="STANDARD">Standard Guests</option>
          </select>

          {/* Stay Status Filter Dropdown */}
          <select
            value={selectedStayFilter}
            onChange={(e: any) => setSelectedStayFilter(e.target.value)}
            className="py-2 px-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white/80 focus:border-[#C5A059] focus:outline-none"
          >
            <option value="ALL">All Stay States</option>
            <option value="IN_HOUSE">Currently In-House</option>
            <option value="UPCOMING">Upcoming Reservations</option>
            <option value="COMPLETED">Past / Checked-Out</option>
          </select>

          {/* Sorting Dropdown */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="py-2 px-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white/80 focus:border-[#C5A059] focus:outline-none"
          >
            <option value="MOST_BOOKINGS">Sort by: Most Stays</option>
            <option value="HIGHEST_SPEND">Sort by: Lifetime Spend</option>
            <option value="NAME_ASC">Sort by: Name (A-Z)</option>
            <option value="RECENT">Sort by: Recently Added</option>
          </select>
        </div>
      </div>

      {/* Main Directory Display */}
      {filteredGuests.length === 0 ? (
        <div className="bg-[#131A2E] border border-white/10 rounded-2xl p-12 text-center text-white/50 font-mono text-xs">
          No guest records found matching search filters.
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuests.map((guest) => {
            const hasActiveStay = guest.bookings?.some((b: any) => b.status === 'CHECKED_IN');
            const totalSpend = guest.totalSpend || guest.bookings?.reduce((s: number, b: any) => s + (b.totalEstimatedPrice || 0), 0) || 0;

            return (
              <div
                key={guest.id}
                className="bg-[#131A2E] border border-white/10 rounded-2xl p-6 hover:border-[#C5A059]/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  {/* Guest Top Card Info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center font-serif font-bold text-[#C5A059] shrink-0 text-base">
                        {guest.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-serif text-base text-white font-bold flex items-center gap-1.5 truncate">
                          <span className="truncate">{guest.fullName}</span>
                          {guest.vipStatus && (
                            <span title="VIP Priority Tier" className="shrink-0">
                              <Crown className="w-4 h-4 text-amber-400" />
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono text-[#C5A059]">
                            {guest.totalBookings || (guest.bookings?.length || 0)} Stay(s)
                          </span>
                          <span className="text-white/30">•</span>
                          <span className="text-[11px] font-mono text-emerald-400">
                            {formatGMD(totalSpend)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* In House Badge */}
                    {hasActiveStay && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0 font-bold">
                        In-House
                      </span>
                    )}
                  </div>

                  {/* Contact Details (Privacy Shield Protected) */}
                  <div className="space-y-2 text-xs text-white/70 pt-3 border-t border-white/10 font-mono">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                      <span className="truncate" title={guest.email}>
                        {maskValue(guest.email, 'email')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                      <span>{maskValue(guest.phone, 'phone')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                      <span>{guest.country || 'The Gambia'}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Button */}
                <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedGuest(guest);
                      setActiveModalTab('overview');
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-[#C5A059] hover:text-black text-white text-xs font-mono font-medium border border-white/10 transition-all flex items-center justify-center gap-2 group"
                  >
                    <History className="w-3.5 h-3.5 text-[#C5A059] group-hover:text-black" />
                    <span>View Guest Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleToggleVip(guest)}
                    className={`p-2.5 rounded-xl border transition-all ${
                      guest.vipStatus
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30'
                        : 'bg-white/5 text-white/40 border-white/10 hover:text-amber-400 hover:border-amber-400/30'
                    }`}
                    title={guest.vipStatus ? 'Revoke VIP Tier' : 'Upgrade to VIP Tier'}
                  >
                    <Crown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-[#131A2E] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 bg-black/30 text-white/50">
                  <th className="p-4 font-normal">GUEST NAME</th>
                  <th className="p-4 font-normal">VIP STATUS</th>
                  <th className="p-4 font-normal">EMAIL (MASKED)</th>
                  <th className="p-4 font-normal">PHONE</th>
                  <th className="p-4 font-normal">COUNTRY</th>
                  <th className="p-4 font-normal">STAYS</th>
                  <th className="p-4 font-normal">LIFETIME SPEND</th>
                  <th className="p-4 text-right font-normal">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredGuests.map((guest) => {
                  const totalSpend = guest.totalSpend || guest.bookings?.reduce((s: number, b: any) => s + (b.totalEstimatedPrice || 0), 0) || 0;
                  return (
                    <tr key={guest.id} className="hover:bg-white/5 transition-all">
                      <td className="p-4 font-medium text-white font-serif text-sm">
                        <button
                          onClick={() => {
                            setSelectedGuest(guest);
                            setActiveModalTab('overview');
                          }}
                          className="hover:text-[#C5A059] flex items-center gap-2"
                        >
                          {guest.fullName}
                        </button>
                      </td>
                      <td className="p-4">
                        {guest.vipStatus ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold inline-flex items-center gap-1">
                            <Crown className="w-3 h-3" /> VIP TIER
                          </span>
                        ) : (
                          <span className="text-white/40 text-[11px]">Standard</span>
                        )}
                      </td>
                      <td className="p-4 text-white/70">{maskValue(guest.email, 'email')}</td>
                      <td className="p-4 text-white/70">{maskValue(guest.phone, 'phone')}</td>
                      <td className="p-4 text-white/80">{guest.country || 'The Gambia'}</td>
                      <td className="p-4 text-[#C5A059] font-bold">
                        {guest.totalBookings || guest.bookings?.length || 0}
                      </td>
                      <td className="p-4 text-emerald-400 font-bold">{formatGMD(totalSpend)}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedGuest(guest);
                            setActiveModalTab('overview');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#C5A059] hover:text-black text-white text-xs border border-white/10 transition-all"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comprehensive Guest Profile Drawer / Modal */}
      {selectedGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#131A2E] border border-white/10 rounded-2xl max-w-3xl w-full p-6 space-y-6 relative shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 flex items-center justify-center font-serif font-bold text-xl">
                  {selectedGuest.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-serif text-white font-bold flex items-center gap-2">
                    {selectedGuest.fullName}
                    {selectedGuest.vipStatus && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono flex items-center gap-1 font-bold">
                        <Crown className="w-3 h-3" /> VIP TIER
                      </span>
                    )}
                  </h3>
                  <div className="text-xs text-white/60 font-mono mt-1 flex items-center gap-3">
                    <span>{maskValue(selectedGuest.email, 'email')}</span>
                    <span>•</span>
                    <span>{maskValue(selectedGuest.phone, 'phone')}</span>
                    <span>•</span>
                    <span>{selectedGuest.country || 'The Gambia'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedGuest(null)}
                className="p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto shrink-0 font-mono text-xs">
              <button
                onClick={() => setActiveModalTab('overview')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activeModalTab === 'overview'
                    ? 'bg-[#C5A059] text-black font-bold'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                Profile & Contacts
              </button>

              <button
                onClick={() => setActiveModalTab('history')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activeModalTab === 'history'
                    ? 'bg-[#C5A059] text-black font-bold'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                Stay & Booking History ({selectedGuest.bookings?.length || 0})
              </button>

              <button
                onClick={() => setActiveModalTab('requests')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activeModalTab === 'requests'
                    ? 'bg-[#C5A059] text-black font-bold'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                Special Requests
              </button>

              <button
                onClick={() => setActiveModalTab('cards')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activeModalTab === 'cards'
                    ? 'bg-[#C5A059] text-black font-bold'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                Smart RFID Access Cards
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              {/* TAB 1: OVERVIEW & CONTACTS */}
              {activeModalTab === 'overview' && (
                <div className="space-y-6 text-xs font-mono">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                      <span className="text-white/50 text-[10px]">TOTAL STAYS</span>
                      <div className="text-xl font-bold text-[#C5A059] mt-1">
                        {selectedGuest.totalBookings || selectedGuest.bookings?.length || 0}
                      </div>
                    </div>
                    <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                      <span className="text-white/50 text-[10px]">TOTAL LIFETIME SPEND</span>
                      <div className="text-xl font-bold text-emerald-400 mt-1">
                        {formatGMD(
                          selectedGuest.totalSpend ||
                            selectedGuest.bookings?.reduce((s: number, b: any) => s + (b.totalEstimatedPrice || 0), 0) || 0
                        )}
                      </div>
                    </div>
                    <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                      <span className="text-white/50 text-[10px]">VIP STATUS</span>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-white font-bold">
                          {selectedGuest.vipStatus ? 'VIP PRIORITY' : 'STANDARD'}
                        </span>
                        <button
                          onClick={() => handleToggleVip(selectedGuest)}
                          disabled={isSaving}
                          className="px-2 py-1 text-[10px] rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-all"
                        >
                          Toggle
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/30 p-5 rounded-xl border border-white/10 space-y-4">
                    <h4 className="text-[#C5A059] text-xs font-bold uppercase tracking-wider">
                      Guest Contact Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-white/40 block mb-1">Full Legal Name:</span>
                        <div className="text-white font-serif text-sm font-semibold">{selectedGuest.fullName}</div>
                      </div>
                      <div>
                        <span className="text-white/40 block mb-1">Email Address:</span>
                        <div className="text-white">
                          {isPrivacyProtected ? maskValue(selectedGuest.email, 'email') : selectedGuest.email}
                        </div>
                      </div>
                      <div>
                        <span className="text-white/40 block mb-1">Phone Number:</span>
                        <div className="text-white">
                          {isPrivacyProtected ? maskValue(selectedGuest.phone, 'phone') : selectedGuest.phone}
                        </div>
                      </div>
                      <div>
                        <span className="text-white/40 block mb-1">Country / Nationality:</span>
                        <div className="text-white">{selectedGuest.country || 'The Gambia'}</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex justify-between items-center text-[11px] text-white/50">
                      <span>Privacy Shield Status: {isPrivacyProtected ? 'Masked' : 'Unmasked'}</span>
                      <button
                        onClick={() => setIsPrivacyProtected(!isPrivacyProtected)}
                        className="text-[#C5A059] underline hover:text-white"
                      >
                        {isPrivacyProtected ? 'Click to unmask sensitive PII' : 'Click to mask PII'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: STAY & BOOKING HISTORY WITH CHECK-IN / CHECK-OUT */}
              {activeModalTab === 'history' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#C5A059] uppercase font-bold tracking-wider">
                      Complete Reservation Timeline
                    </span>
                    <span className="text-white/40">
                      {selectedGuest.bookings?.length || 0} Total Record(s)
                    </span>
                  </div>

                  {(!selectedGuest.bookings || selectedGuest.bookings.length === 0) ? (
                    <div className="p-8 text-center text-white/40 font-mono text-xs bg-black/30 rounded-xl border border-white/10">
                      No historical bookings recorded for this guest profile.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedGuest.bookings.map((b: any) => (
                        <div
                          key={b.id}
                          className="bg-black/40 border border-white/10 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#C5A059] text-sm">{b.bookingReference}</span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  b.status === 'CHECKED_IN'
                                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                    : b.status === 'CHECKED_OUT'
                                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                    : b.status === 'CONFIRMED'
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                }`}
                              >
                                {b.status}
                              </span>
                            </div>

                            <div className="text-white font-bold font-serif text-sm pt-1">
                              Suite: {b.suiteName}
                            </div>

                            <div className="text-white/60 text-[11px] flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                              <span>
                                {b.checkIn} to {b.checkOut} ({b.totalNights} Night/s)
                              </span>
                            </div>

                            {b.specialRequests && (
                              <div className="text-[11px] text-amber-300/80 italic pt-1">
                                Request: "{b.specialRequests}"
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col md:items-end justify-between gap-3 shrink-0">
                            <div className="text-right">
                              <div className="text-lg font-bold text-emerald-400">{formatGMD(b.totalEstimatedPrice)}</div>
                              <div className="text-[10px] text-white/40">{b.guestsCount} Guest(s)</div>
                            </div>

                            {/* Direct Check-In / Check-Out Action Buttons */}
                            <div className="flex items-center gap-2">
                              {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                                <button
                                  onClick={() => handleActionCheckIn(b.id)}
                                  disabled={isSaving}
                                  className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 transition-all font-bold flex items-center gap-1 text-[11px]"
                                >
                                  <LogIn className="w-3.5 h-3.5" /> Process Check-In
                                </button>
                              )}

                              {b.status === 'CHECKED_IN' && (
                                <button
                                  onClick={() => handleActionCheckOut(b.id)}
                                  disabled={isSaving}
                                  className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30 transition-all font-bold flex items-center gap-1 text-[11px]"
                                >
                                  <LogOut className="w-3.5 h-3.5" /> Process Check-Out
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SPECIAL REQUESTS & PREFERENCES */}
              {activeModalTab === 'requests' && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#C5A059] uppercase font-bold tracking-wider">
                      Guest Preferences & Special Requests
                    </span>
                    <span className="text-white/40">Managed via REST API</span>
                  </div>

                  {(!selectedGuest.bookings || selectedGuest.bookings.length === 0) ? (
                    <div className="p-6 text-center text-white/40 bg-black/30 rounded-xl">
                      No active bookings found to set special requests.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedGuest.bookings.map((b: any) => (
                        <div key={b.id} className="bg-black/40 border border-white/10 rounded-xl p-5 space-y-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-bold text-[#C5A059]">{b.bookingReference}</span>
                              <span className="text-white/60 ml-2">({b.suiteName})</span>
                            </div>
                            <span className="text-white/40 text-[10px]">{b.checkIn} to {b.checkOut}</span>
                          </div>

                          {editingSpecialRequestBooking?.id === b.id ? (
                            <div className="space-y-3 pt-2">
                              <textarea
                                value={editingSpecialRequestBooking.text}
                                onChange={(e) =>
                                  setEditingSpecialRequestBooking({
                                    ...editingSpecialRequestBooking,
                                    text: e.target.value,
                                  })
                                }
                                placeholder="Enter airport shuttle preferences, dietary requirements, late check-in notes..."
                                rows={3}
                                className="w-full p-3 bg-black/60 border border-[#C5A059] rounded-xl text-xs text-white placeholder-white/30 focus:outline-none"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setEditingSpecialRequestBooking(null)}
                                  className="px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 text-[11px]"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleSaveSpecialRequests}
                                  disabled={isSaving}
                                  className="px-4 py-1.5 rounded-lg bg-[#C5A059] text-black font-bold hover:bg-[#b08d49] text-[11px] flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" /> Save Request
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                              <div className="text-white/80 italic">
                                {b.specialRequests || 'No special requests recorded for this stay.'}
                              </div>
                              <button
                                onClick={() =>
                                  setEditingSpecialRequestBooking({ id: b.id, text: b.specialRequests || '' })
                                }
                                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[#C5A059] hover:text-black text-white text-[11px] transition-all flex items-center gap-1 shrink-0 ml-3"
                              >
                                <Edit3 className="w-3 h-3" /> Edit Request
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: SMART RFID ACCESS CARDS */}
              {activeModalTab === 'cards' && (
                <div className="space-y-4 font-mono text-xs">
                  <span className="text-[#C5A059] uppercase font-bold tracking-wider block">
                    Issued Smart RFID Keycards
                  </span>

                  {(!selectedGuest.bookings || selectedGuest.bookings.length === 0) ? (
                    <div className="p-6 text-center text-white/40 bg-black/30 rounded-xl">
                      No access keycards assigned.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedGuest.bookings.map((b: any) => (
                        <div key={b.id} className="bg-black/40 border border-white/10 rounded-xl p-5 space-y-2">
                          <div className="flex items-center gap-2 text-[#C5A059] font-bold">
                            <Key className="w-4 h-4" /> RFID Keycard Voucher
                          </div>
                          <div className="text-white font-bold">{b.suiteName} ({b.bookingReference})</div>
                          <div className="text-white/50 text-[11px]">
                            Card Ref: {b.accessCard?.cardNumber || `AC-${b.bookingReference}`}
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-white/10">
                            <span className="text-white/40">Status:</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                b.status === 'CHECKED_IN'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-white/10 text-white/50'
                              }`}
                            >
                              {b.status === 'CHECKED_IN' ? 'ACTIVE / AUTHORIZED' : 'INACTIVE'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-white/10 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedGuest(null)}
                className="px-5 py-2 rounded-xl bg-white/10 text-white font-mono text-xs hover:bg-white/20 transition-all"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
