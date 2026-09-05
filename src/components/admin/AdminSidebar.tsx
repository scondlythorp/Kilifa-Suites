import React from 'react';
import { LayoutDashboard, Hotel, CalendarCheck, Users, Image, ShieldCheck, BellRing, TrendingUp, Building2, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingCount = 0,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      id: 'suites',
      label: 'Suites & Pricing',
      icon: Hotel,
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: CalendarCheck,
    },
    {
      id: 'guests',
      label: 'Guest Profiles',
      icon: Users,
    },
    {
      id: 'media',
      label: 'Media Gallery',
      icon: Image,
    },
    {
      id: 'access',
      label: 'Electronic Access',
      icon: ShieldCheck,
    },
    {
      id: 'notifications',
      label: 'Notification Hub',
      icon: BellRing,
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      icon: TrendingUp,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#0B101D] border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-serif font-bold text-white tracking-wide block">
                KILIFA SUITES
              </span>
              <span className="text-[10px] font-mono text-[#C5A059] uppercase tracking-widest block">
                Admin Console
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#C5A059] text-black font-semibold shadow-lg shadow-[#C5A059]/20'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-[#C5A059]'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-mono font-bold ${
                      isActive
                        ? 'bg-black/20 text-black'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Return to Public Website */}
      <div className="p-4 border-t border-white/10 mt-auto">
        <Link
          to="/"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs border border-white/10 transition-all font-mono"
        >
          <Home className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>View Public Guest Portal</span>
        </Link>
      </div>
    </aside>
  );
};
