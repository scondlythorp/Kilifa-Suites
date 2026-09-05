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
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="w-8 h-8 border border-[#C5A059] flex items-center justify-center group-hover:bg-[#C5A059] transition-colors">
            <span className="text-[#C5A059] font-serif text-lg italic group-hover:text-black transition-colors">K</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-light tracking-[0.25em] text-white uppercase leading-tight group-hover:text-[#C5A059] transition-colors">
              {BUSINESS_CONFIG.name}
            </span>
            <span className="text-[9px] font-semibold text-[#C5A059] tracking-[0.3em] uppercase">
              TABOKOTO • SOMA
            </span>
          </div>
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

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </Container>
    </header>
  );
};
