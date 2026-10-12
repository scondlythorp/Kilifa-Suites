import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Container } from '../common/Container';
import { Button } from '../common/Button';
import { BUSINESS_CONFIG } from '../../config/business';
import { Menu, X, Calendar, ChevronDown, Shield, Sparkles, Image, Compass, Mail, Lock } from 'lucide-react';

interface NavbarProps {
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

export const MAIN_NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Suites', href: '/suites' },
  { label: 'About', href: '/about' },
  { label: 'Amenities', href: '/amenities' },
];

export const DROPDOWN_NAV_LINKS = [
  { label: 'Guest Experience', href: '/guest-experience', icon: Sparkles },
  { label: 'Security & Safety', href: '/security', icon: Lock },
  { label: 'Photo Gallery', href: '/gallery', icon: Image },
  { label: 'Workshops & Events', href: '/workshops', icon: Compass },
  { label: 'Estate Location', href: '/location', icon: Compass },
  { label: 'Contact Us', href: '/contact', icon: Mail },
];

export const NAV_LINKS = [...MAIN_NAV_LINKS, ...DROPDOWN_NAV_LINKS];

export const Navbar: React.FC<NavbarProps> = ({
  onMobileMenuToggle,
  isMobileMenuOpen,
}) => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location.pathname]);

  const isDropdownActive = DROPDOWN_NAV_LINKS.some((link) => location.pathname === link.href);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0A0A0A]/95 backdrop-blur-md shadow-2xl py-3 border-b border-white/10'
          : 'bg-gradient-to-b from-black/90 via-[#0A0A0A]/80 to-transparent py-5 border-b border-white/5'
      }`}
    >
      <Container size="xl" className="flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center group focus:outline-none py-0.5">
          <img
            src="/media/images/kilifa-logo.jpeg"
            alt={BUSINESS_CONFIG.name}
            className="h-9 sm:h-11 w-auto object-contain transition-all duration-300 group-hover:scale-105 group-hover:brightness-125"
            style={{
              mixBlendMode: 'screen',
              filter: 'invert(1) contrast(1.25) brightness(1.15)',
            }}
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {MAIN_NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3 py-2 rounded text-[11px] font-medium uppercase tracking-widest transition-colors relative ${
                  isActive
                    ? 'text-[#C5A059] font-semibold bg-white/5'
                    : 'text-white/70 hover:text-[#C5A059] hover:bg-white/5'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#C5A059] rounded-full" />
                )}
              </Link>
            );
          })}

          {/* Explore Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className={`px-3 py-2 rounded text-[11px] font-medium uppercase tracking-widest transition-colors flex items-center gap-1.5 ${
                isDropdownActive || isDropdownOpen
                  ? 'text-[#C5A059] font-semibold bg-white/5'
                  : 'text-white/70 hover:text-[#C5A059] hover:bg-white/5'
              }`}
            >
              <span>Explore</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-[#111111] border border-white/10 rounded-xl shadow-2xl py-2 z-50 backdrop-blur-xl animate-fadeIn">
                {DROPDOWN_NAV_LINKS.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors ${
                        isActive
                          ? 'text-[#C5A059] bg-white/10 font-bold'
                          : 'text-white/80 hover:text-[#C5A059] hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Action Button & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Reserve Suite Button */}
          <Button
            to="/booking"
            variant="secondary"
            size="sm"
            leftIcon={<Calendar className="w-3.5 h-3.5" />}
          >
            Book Stay
          </Button>

          {/* Menu Toggle Button (Visible on mobile & desktop) */}
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-white/10 hover:border-[#C5A059] text-white/80 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
            aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-[#C5A059]" />
            ) : (
              <Menu className="w-5 h-5 text-[#C5A059]" />
            )}
            <span className="hidden sm:inline text-xs font-semibold uppercase tracking-widest text-white/90">
              Menu
            </span>
          </button>
        </div>
      </Container>
    </header>
  );
};
