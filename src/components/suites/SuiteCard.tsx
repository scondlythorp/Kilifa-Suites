import React from 'react';
import { Suite } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ImagePlaceholder } from '../common/ImagePlaceholder';
import { Users, Bed, ShieldCheck, Zap, ArrowRight, Eye } from 'lucide-react';
import { formatNightlyRate } from '../../utils/currency';

interface SuiteCardProps {
  suite: Suite;
  onBookClick?: (suite: Suite) => void;
}

export const SuiteCard: React.FC<SuiteCardProps> = ({ suite, onBookClick }) => {
  return (
    <Card className="flex flex-col h-full overflow-hidden p-0 group border border-white/10 bg-[#111111]">
      {/* Header Image */}
      <div className="relative overflow-hidden aspect-video bg-[#1A1A1A]">
        {suite.featuredImage && !suite.featuredImage.includes('placeholder') ? (
          <>
            <img
              src={suite.featuredImage}
              alt={suite.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
          </>
        ) : (
          <ImagePlaceholder
            title={suite.name}
            subtitle={suite.floor}
            aspectRatio="video"
          />
        )}
        {/* Availability Status Badge */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-black/80 backdrop-blur-sm text-[#C5A059] text-[10px] font-semibold uppercase tracking-widest flex items-center gap-1.5 border border-[#C5A059]/30 z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
          Ready for Booking
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 flex flex-col flex-grow bg-[#111111] text-white">
        {/* Floor & Name */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-[#C5A059] uppercase tracking-widest bg-white/5 px-2.5 py-0.5 rounded border border-white/10">
            {suite.floor}
          </span>
        </div>

        <h3 className="text-xl text-white font-serif italic group-hover:text-[#C5A059] transition-colors mb-2">
          {suite.name}
        </h3>

        <p className="text-xs text-white/60 line-clamp-2 mb-4">
          {suite.shortDescription}
        </p>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-2 mb-5 py-3 border-y border-white/10 text-xs text-white/60">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
            <span>Up to {suite.maxOccupancy} Guests</span>
          </div>
          <div className="flex items-center gap-2">
            <Bed className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
            <span>{suite.bedType}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
            <span>24/7 Solar Backup</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
            <span>Keycard Access</span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="mt-auto pt-2 space-y-3">
          <div className="flex items-baseline justify-between border-b border-white/5 pb-2">
            <span className="text-[10px] uppercase tracking-widest text-white/40 block">Rate per night</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-[#C5A059] font-serif">
                {formatNightlyRate(suite.pricePerNight)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              to={`/suites/${suite.slug}`}
              variant="outline"
              size="sm"
              className="w-full justify-center text-xs py-2 px-2"
              leftIcon={<Eye className="w-3.5 h-3.5" />}
            >
              Details
            </Button>
            <Button
              to={`/booking?suite=${suite.slug}`}
              variant="primary"
              size="sm"
              className="w-full justify-center text-xs py-2 px-2 font-bold"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => onBookClick && onBookClick(suite)}
            >
              Reserve
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
