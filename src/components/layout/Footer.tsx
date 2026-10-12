import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../common/Container';
import { BUSINESS_CONFIG } from '../../config/business';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0A0A0A] text-white border-t border-white/10 pt-16 pb-12">
      <Container size="xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Column 1: Brand Info & Owner Note */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-[#C5A059] flex items-center justify-center text-[#C5A059] font-serif text-lg italic">
                K
              </div>
              <div>
                <span className="text-lg font-light tracking-[0.25em] text-white uppercase font-display block">
                  {BUSINESS_CONFIG.name}
                </span>
                <span className="text-[10px] font-semibold text-[#C5A059] tracking-[0.3em] uppercase block">
                  {BUSINESS_CONFIG.category}
                </span>
              </div>
            </div>

            <p className="text-xs text-white/50 max-w-md leading-relaxed">
              {BUSINESS_CONFIG.tagline}. Comprising 12 executive private suites across 2 secure, solar-powered houses in Soma, Lower River Region.
            </p>


          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#C5A059]">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-white/60">
              <li>
                <Link to="/" className="hover:text-[#C5A059] transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link to="/suites" className="hover:text-[#C5A059] transition-colors">
                  All 12 Suites
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#C5A059] transition-colors">
                  About & Founder Story
                </Link>
              </li>
              <li>
                <Link to="/amenities" className="hover:text-[#C5A059] transition-colors">
                  Property Amenities
                </Link>
              </li>
              <li>
                <Link to="/guest-experience" className="hover:text-[#C5A059] transition-colors">
                  Guest Experience
                </Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-[#C5A059] transition-colors">
                  Security & Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Secondary Links */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#C5A059]">
              Explore & Book
            </h4>
            <ul className="space-y-2 text-xs text-white/60">
              <li>
                <Link to="/gallery" className="hover:text-[#C5A059] transition-colors">
                  Photo & Video Gallery
                </Link>
              </li>
              <li>
                <Link to="/workshops" className="hover:text-[#C5A059] transition-colors">
                  Workshops & Retreats
                </Link>
              </li>
              <li>
                <Link to="/location" className="hover:text-[#C5A059] transition-colors">
                  Location & Map
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#C5A059] transition-colors">
                  Contact Direct
                </Link>
              </li>
              <li>
                <Link to="/booking" className="text-[#C5A059] font-semibold hover:underline">
                  Reserve a Suite
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Location */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#C5A059]">
              Location & Contact
            </h4>
            <div className="space-y-2.5 text-xs text-white/60">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <span>{BUSINESS_CONFIG.location.fullAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                <a href={BUSINESS_CONFIG.contact.whatsappUrl} className="hover:text-white">
                  {BUSINESS_CONFIG.contact.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
                <a href={`mailto:${BUSINESS_CONFIG.contact.email}`} className="hover:text-white">
                  {BUSINESS_CONFIG.contact.email}
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-2 flex items-center gap-3 text-white/60">
              <a
                href={BUSINESS_CONFIG.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2 border border-white/10 hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={BUSINESS_CONFIG.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="p-2 border border-white/10 hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={BUSINESS_CONFIG.socials.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="p-2 border border-white/10 hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.35 22a6.33 6.33 0 0 0 6.33-6.32V9.05a8.16 8.16 0 0 0 3.91 1.08V6.69z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-[0.2em] text-white/40">
          <p>
            © {new Date().getFullYear()} {BUSINESS_CONFIG.name}. All rights reserved. Tabokoto, Soma, The Gambia.
          </p>

          <div className="flex items-center gap-4 text-white/50 font-mono">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#C5A059]" /> 24/7 Solar Power
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" /> Private Keycard Compound
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
};
