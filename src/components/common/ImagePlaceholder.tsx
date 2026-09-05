import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImagePlaceholderProps {
  title: string;
  subtitle?: string;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'wide';
  className?: string;
  houseBadge?: number;
  suiteNumber?: number;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  title,
  subtitle = 'Kilifa Suites Official Media Asset',
  aspectRatio = 'video',
  className = '',
}) => {
  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    wide: 'aspect-[21/9]',
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-[#161616] via-[#111111] to-[#0A0A0A] text-white flex flex-col items-center justify-center p-6 border border-white/10 group select-none ${aspectClasses[aspectRatio]} ${className}`}
    >
      {/* Subtle Pattern Grid */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Diagonal Accent Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#C5A059]/10 rounded-full blur-xl group-hover:bg-[#C5A059]/20 transition-all duration-300" />

      {/* Center Icon & Branding */}
      <div className="relative z-10 flex flex-col items-center text-center p-4">
        <div className="w-10 h-10 border border-[#C5A059] flex items-center justify-center text-[#C5A059] font-serif text-lg italic mb-3 group-hover:scale-110 transition-transform duration-300">
          K
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#C5A059] mb-1">
          KILIFA SUITES
        </span>
        <h4 className="text-sm sm:text-base font-serif italic text-white max-w-xs leading-snug">
          {title}
        </h4>
        <p className="text-[11px] sm:text-xs text-white/50 mt-1 flex items-center gap-1">
          <ImageIcon className="w-3 h-3 text-[#C5A059]" />
          {subtitle}
        </p>
      </div>

      {/* Architectural Corner Markers */}
      <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#C5A059]/40" />
      <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#C5A059]/40" />
      <div className="absolute bottom-2 right-2 text-[9px] text-white/30 uppercase tracking-widest font-mono">
        Tabokoto, Soma
      </div>
    </div>
  );
};
