import React, { useState } from 'react';
import { MapPin, ExternalLink, Navigation, Layers, Compass } from 'lucide-react';
import { BUSINESS_CONFIG } from '../../config/business';

interface GoogleMapEmbedProps {
  className?: string;
  heightClass?: string;
  aspectClass?: string;
  defaultZoom?: number;
  showControls?: boolean;
}

export const GoogleMapEmbed: React.FC<GoogleMapEmbedProps> = ({
  className = '',
  heightClass = 'min-h-[380px]',
  aspectClass = 'aspect-[16/9]',
  defaultZoom = 14,
  showControls = true,
}) => {
  const [mapType, setMapType] = useState<'m' | 'k'>('m'); // 'm' = standard road map, 'k' = satellite
  const [zoom, setZoom] = useState<number>(defaultZoom);

  const encodedAddress = encodeURIComponent(BUSINESS_CONFIG.location.fullAddress);
  // Zero-Key Free Google Maps Embed URL
  const embedUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=${mapType === 'k' ? 'k' : ''}&z=${zoom}&ie=UTF8&iwloc=&output=embed`;

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden bg-[#111111] border border-white/10 shadow-2xl flex flex-col group ${className}`}
    >
      {/* Top Header & Interactive Controls Bar */}
      {showControls && (
        <div className="bg-[#141414] px-4 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white tracking-wide block">
                Kilifa Suites Location
              </span>
              <span className="text-[10px] text-white/50 block">
                {BUSINESS_CONFIG.location.neighborhood}, {BUSINESS_CONFIG.location.city}, {BUSINESS_CONFIG.location.country}
              </span>
            </div>
          </div>

          {/* Map Layer Controls */}
          <div className="flex items-center gap-2 text-xs">
            {/* View Mode Toggle: Map vs Satellite */}
            <div className="inline-flex rounded-lg bg-black/40 border border-white/10 p-0.5">
              <button
                type="button"
                onClick={() => setMapType('m')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  mapType === 'm'
                    ? 'bg-[#C5A059] text-black font-semibold'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Road Map
              </button>
              <button
                type="button"
                onClick={() => setMapType('k')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                  mapType === 'k'
                    ? 'bg-[#C5A059] text-black font-semibold'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                Satellite
              </button>
            </div>

            {/* Zoom presets */}
            <div className="hidden sm:inline-flex rounded-lg bg-black/40 border border-white/10 p-0.5">
              <button
                type="button"
                onClick={() => setZoom(15)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  zoom === 15 ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white'
                }`}
                title="Estate Close-Up View"
              >
                Street
              </button>
              <button
                type="button"
                onClick={() => setZoom(13)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  zoom === 13 ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white'
                }`}
                title="Regional Soma Highway Context"
              >
                Region
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Map iFrame */}
      <div className={`relative w-full ${heightClass} ${aspectClass} bg-[#0A0A0A]`}>
        <iframe
          key={`${mapType}-${zoom}`}
          title="Kilifa Suites Google Map Location"
          src={embedUrl}
          className="w-full h-full border-0 absolute inset-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      {/* Bottom Bar: Quick Directions & Coordinates */}
      <div className="bg-[#141414]/95 backdrop-blur-md px-4 py-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-white/70 font-mono text-[11px]">
          <Compass className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>
            {BUSINESS_CONFIG.location.coordinates.lat}° N, {Math.abs(BUSINESS_CONFIG.location.coordinates.lng)}° W
          </span>
          <span className="hidden md:inline text-white/30">•</span>
          <span className="hidden md:inline text-white/50 font-sans">
            Trans-Gambia Highway Transit Corridor
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={BUSINESS_CONFIG.location.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C5A059] hover:text-[#D4AF66] flex items-center gap-1.5 font-medium text-xs transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Get Directions</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
          </a>
        </div>
      </div>
    </div>
  );
};
