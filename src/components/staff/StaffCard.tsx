import React from 'react';
import { Staff } from '../../types';
import { ImagePlaceholder } from '../common/ImagePlaceholder';
import {
  Mail,
  Linkedin,
  Twitter,
  Instagram,
  Phone,
  UserCheck,
  ShieldCheck,
  Award,
  BadgeCheck,
  Briefcase,
} from 'lucide-react';

interface StaffCardProps {
  staff: Staff;
  featured?: boolean;
}

export const StaffCard: React.FC<StaffCardProps> = ({ staff, featured = false }) => {
  const isFounder = staff.role === 'owner' || featured;
  const positionText = staff.position || staff.title;

  return (
    <div
      className={`rounded-2xl bg-[#111111] border transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
        isFounder
          ? 'border-[#C5A059] shadow-[0_0_25px_rgba(197,160,89,0.15)] ring-1 ring-[#C5A059]/30'
          : 'border-white/10 hover:border-[#C5A059]/50 hover:shadow-xl'
      }`}
    >
      <div className="p-6 space-y-5">
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[#C5A059]">
            {staff.department || 'Kilifa Suites Team'}
          </span>

          {isFounder && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-black bg-[#C5A059] px-2.5 py-1 rounded shadow">
              <Award className="w-3 h-3" />
              <span>Executive</span>
            </span>
          )}
        </div>

        {/* Staff Photo Viewport */}
        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#1A1A1A] group-hover:border-[#C5A059]/40 transition-colors aspect-[3/4]">
          {staff.avatar && !staff.avatar.startsWith('[') && !staff.avatar.includes('placeholder') ? (
            <img
              src={staff.avatar}
              alt={staff.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <ImagePlaceholder
              title={staff.name}
              subtitle={positionText}
              aspectRatio="portrait"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70" />

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs z-10">
            <span className="text-[10px] font-mono font-medium text-[#C5A059]">
              ID: {staff.id.toUpperCase()}
            </span>
            <BadgeCheck className="w-4 h-4 text-[#C5A059]" />
          </div>
        </div>

        {/* Name & Position */}
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-serif italic text-white group-hover:text-[#C5A059] transition-colors">
            {staff.name}
          </h3>
          <p className="text-xs font-semibold text-[#C5A059] uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" />
            <span>{positionText}</span>
          </p>
        </div>

        {/* Biography */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
          <span className="text-[9px] uppercase tracking-widest text-white/40 font-mono block">
            Biography & Profile
          </span>
          <p className="text-xs text-white/70 leading-relaxed font-light">
            {staff.bio}
          </p>
        </div>
      </div>

      {/* Footer & Social Links */}
      <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-white/50">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Verified Staff</span>
        </div>

        {/* Optional Social Links */}
        {staff.socialLinks && (
          <div className="flex items-center gap-2">
            {staff.socialLinks.email && (
              <a
                href={`mailto:${staff.socialLinks.email}`}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-[#C5A059] hover:text-black text-white/70 transition-colors"
                title={`Email ${staff.name}`}
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
            )}

            {staff.socialLinks.whatsapp && (
              <a
                href={`https://wa.me/${staff.socialLinks.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-[#C5A059] hover:text-black text-white/70 transition-colors"
                title="WhatsApp Contact"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            )}

            {staff.socialLinks.linkedin && (
              <a
                href={staff.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-[#C5A059] hover:text-black text-white/70 transition-colors"
                title="LinkedIn Profile"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            )}

            {staff.socialLinks.twitter && (
              <a
                href={staff.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-[#C5A059] hover:text-black text-white/70 transition-colors"
                title="Twitter Profile"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
