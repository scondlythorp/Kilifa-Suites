import React from 'react';
import { Play, Film } from 'lucide-react';

interface VideoPlaceholderProps {
  title: string;
  duration?: string;
  className?: string;
  thumbnail?: string;
  posterImage?: string;
  onPlayClick?: () => void;
}

export const VideoPlaceholder: React.FC<VideoPlaceholderProps> = ({
  title,
  duration = '02:30',
  className = '',
  thumbnail,
  posterImage,
  onPlayClick,
}) => {
  const bgImg = thumbnail || posterImage;
  const hasRealBg = bgImg && !bgImg.startsWith('[') && !bgImg.includes('placeholder');

  return (
    <div
      onClick={onPlayClick}
      className={`relative w-full aspect-video overflow-hidden rounded-xl bg-[#111111] text-white flex flex-col items-center justify-center p-6 border border-white/10 group cursor-pointer select-none ${className}`}
    >
      {hasRealBg ? (
        <>
          <img
            src={bgImg}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:20px_20px]" />
        </>
      )}

      {/* Top Video Tag */}
      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-sm bg-black/80 border border-[#C5A059]/30 text-[#C5A059] text-[10px] font-semibold uppercase tracking-[0.2em] backdrop-blur-md flex items-center gap-1.5 z-10">
        <Film className="w-3.5 h-3.5" />
        Video Tour
      </div>

      {/* Duration Badge */}
      <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/80 text-white/70 text-xs font-mono border border-white/10 z-10">
        {duration}
      </div>

      {/* Center Interactive Play Button */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <button
          type="button"
          aria-label={`Play ${title}`}
          className="w-16 h-16 rounded-full bg-[#C5A059] text-black flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300 mb-3"
        >
          <Play className="w-7 h-7 fill-current ml-1" />
        </button>
        <h4 className="text-sm sm:text-base font-serif italic text-white max-w-sm drop-shadow-md">
          {title}
        </h4>
        <p className="text-xs text-white/70 mt-1 font-medium">
          Click to play property walkthrough
        </p>
      </div>

      {/* Corner Overlay info */}
      <div className="absolute bottom-3 left-3 text-[10px] uppercase tracking-widest text-white/50 font-mono z-10">
        KILIFA SUITES • SOMA, THE GAMBIA
      </div>
    </div>
  );
};
