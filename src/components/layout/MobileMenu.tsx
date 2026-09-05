import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS } from './Navbar';
import { BUSINESS_CONFIG } from '../../config/business';
import { Button } from '../common/Button';
import { X, Phone, Mail, MapPin, Calendar, Building2, ChevronRight } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-[#0A0A0A] text-white animate-fadeIn overflow-y-auto">
      {/* Drawer Top Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-[#C5A059] flex items-center justify-center text-[#C5A059] font-serif text-lg italic">
            K
          </div>
          <div>
            <span className="text-sm font-light tracking-[0.2em] text-white uppercase font-display block">
              {BUSINESS_CONFIG.name}
            </span>
            <span className="text-[9px] text-[#C5A059] uppercase tracking-[0.3em] font-semibold">
              Tabokoto, Soma
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2.5 rounded-full border border-white/10 hover:border-[#C5A059] text-white transition-colors"
          aria-label="Close Mobile Menu"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Nav Links List */}
      <div className="flex-1 p-6 space-y-1">
        {NAV_LINKS.map((link) => {
          const isActive = location.pathname === link.href;
          return (
            <Link
              key={link.href}
              to={link.href}
              onClick={onClose}
              className={`flex items-center justify-between p-3.5 rounded text-xs font-semibold uppercase tracking-widest transition-all ${
                isActive
                  ? 'bg-white/10 text-[#C5A059] border-l-2 border-[#C5A059]'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{link.label}</span>
              <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#C5A059]' : 'text-white/30'}`} />
            </Link>
          );
        })}

        <div className="pt-4">
          <Link
            to="/booking"
            onClick={onClose}
            className="flex items-center justify-between p-4 bg-[#C5A059] text-black font-bold text-xs uppercase tracking-widest shadow-md hover:bg-[#D4AF66] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>Reserve a Suite</span>
            </div>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer Contact Info */}
      <div className="p-6 bg-[#111111] border-t border-white/10 space-y-3 text-xs text-white/50">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#C5A059] shrink-0" />
          <span>{BUSINESS_CONFIG.location.fullAddress}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
          <span>{BUSINESS_CONFIG.contact.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
          <span>{BUSINESS_CONFIG.contact.email}</span>
        </div>
        <div className="pt-2 text-[10px] text-white/40 uppercase tracking-widest font-mono">
          Proprietor: {BUSINESS_CONFIG.owner} • 12 Suites in 2 Houses
        </div>
      </div>
    </div>
  );
};
