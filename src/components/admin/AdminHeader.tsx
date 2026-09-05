import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Shield, RefreshCw, Bell } from 'lucide-react';

interface AdminHeaderProps {
  activeTab: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onTabChange?: (tab: string) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ activeTab, onRefresh, isRefreshing, onTabChange }) => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'ADMIN':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'RECEPTIONIST':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'STAFF':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0E1525]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#C5A059] uppercase block">
            Management Portal
          </span>
          <h1 className="text-xl font-serif text-white capitalize">{activeTab}</h1>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-xs flex items-center gap-1 border border-white/10"
            title="Refresh API Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#C5A059]' : ''}`} />
            <span className="hidden sm:inline">Sync API</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {onTabChange && (
          <button
            onClick={() => onTabChange('notifications')}
            className={`p-2 rounded-lg relative transition-all border ${
              activeTab === 'notifications'
                ? 'bg-[#C5A059]/20 border-[#C5A059] text-[#C5A059]'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white'
            }`}
            title="Admin Notifications Center"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#C5A059] animate-pulse" />
          </button>
        )}

        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium text-white">{user.name}</div>
              <div className="text-[11px] text-white/50">{user.email}</div>
            </div>

            <div className={`px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider border uppercase flex items-center gap-1 ${getRoleBadge(user.role)}`}>
              <Shield className="w-3 h-3" />
              <span>{user.role}</span>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all text-xs flex items-center gap-1.5"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
