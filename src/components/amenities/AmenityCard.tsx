import React from 'react';
import { Amenity } from '../../types';
import { Card } from '../common/Card';
import {
  ShieldCheck,
  Zap,
  Wind,
  Wifi,
  Bath,
  Coffee,
  Briefcase,
  Car,
  Sparkles,
  Tv,
  Sofa,
  Layers,
  Palette,
  Droplets,
  Sun,
  ConciergeBell,
  Compass,
  Key,
  Flame,
  Building2,
} from 'lucide-react';

interface AmenityCardProps {
  amenity: Amenity;
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  ShieldCheck,
  Zap,
  Wind,
  Wifi,
  Bath,
  Coffee,
  Briefcase,
  Car,
  Sparkles,
  Tv,
  Sofa,
  Layers,
  Palette,
  Droplets,
  Sun,
  ConciergeBell,
  Compass,
  Key,
  Flame,
  Building2,
};

export const AmenityCard: React.FC<AmenityCardProps> = ({ amenity }) => {
  const IconComponent = iconMap[amenity.icon] || Sparkles;

  return (
    <Card className="flex flex-col h-full p-6 transition-all duration-300 hover:border-[#C5A059] border border-white/10 bg-[#111111]">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 border border-[#C5A059]/40 text-[#C5A059] flex items-center justify-center bg-white/5">
          <IconComponent className="w-5 h-5 text-[#C5A059]" />
        </div>
        {amenity.isFeatured && (
          <span className="px-2.5 py-0.5 rounded bg-white/5 border border-[#C5A059]/30 text-[#C5A059] text-[10px] font-semibold tracking-widest uppercase">
            Signature Feature
          </span>
        )}
      </div>

      <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold mb-1">
        {amenity.category}
      </span>

      <h3 className="text-style-h3 text-white font-serif italic mb-2">
        {amenity.name}
      </h3>

      <p className="text-style-body text-xs text-white/60 mt-auto">
        {amenity.description}
      </p>
    </Card>
  );
};
