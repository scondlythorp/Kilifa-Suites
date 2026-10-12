import React, { useEffect, useState, useRef } from 'react';
import { Media } from '../../types';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Building2,
  Tag,
  Info,
} from 'lucide-react';

interface LightboxModalProps {
  isOpen: boolean;
  media: Media | null;
  currentIndex?: number;
  totalCount?: number;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  media,
  currentIndex,
  totalCount,
  onClose,
  onNext,
  onPrev,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onNext, onPrev, onClose]);

  if (!isOpen || !media) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50 && onNext) {
      onNext(); // Swiped left -> Next
    } else if (diff < -50 && onPrev) {
      onPrev(); // Swiped right -> Prev
    }
    touchStartX.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-3 sm:p-6 animate-fadeIn select-none"
    >
      {/* Top Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C5A059] bg-white/5 border border-[#C5A059]/30 px-3 py-1 rounded">
            {media.category}
          </span>
          {typeof currentIndex === 'number' && typeof totalCount === 'number' && (
            <span className="text-xs font-mono text-white/60">
              {currentIndex + 1} / {totalCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close Lightbox"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Prev Navigation Button */}
      {onPrev && (
        <button
          type="button"
          onClick={onPrev}
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/50 border border-white/20 hover:bg-[#C5A059] hover:text-black hover:border-[#C5A059] text-white transition-all shadow-2xl"
          aria-label="Previous Image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next Navigation Button */}
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/50 border border-white/20 hover:bg-[#C5A059] hover:text-black hover:border-[#C5A059] text-white transition-all shadow-2xl"
          aria-label="Next Image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Main Image Viewport */}
      <div className="max-w-5xl w-full flex flex-col items-center justify-center my-auto pt-12 pb-6 px-2">
        <div className="relative w-full aspect-video sm:aspect-[16/10] rounded-2xl overflow-hidden bg-black border border-[#C5A059]/40 shadow-2xl flex flex-col items-center justify-center text-white text-center group">
          {media.url && !media.url.startsWith('[') ? (
            <img
              src={media.url}
              alt={media.alt || media.caption}
              className="w-full h-full object-contain bg-black"
              onError={(e) => {
                // If media fails, fallback to styled placeholder
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-[#C5A059]/40 text-[#C5A059] flex items-center justify-center shadow-xl">
                <Building2 className="w-8 h-8" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#C5A059]">
                KILIFA SUITES • PROPERTY MEDIA
              </span>
              <h3 className="text-xl sm:text-3xl font-serif italic text-white max-w-xl leading-snug">
                {media.caption}
              </h3>
            </div>
          )}
        </div>

        {/* Caption & Metadata Bar */}
        <div className="mt-4 text-center space-y-1 max-w-2xl">
          <p className="text-sm font-serif italic text-white">{media.caption}</p>
          <p className="text-[11px] text-[#C5A059] uppercase tracking-widest font-mono">
            Kilifa Suites • Tabokoto, Soma • {media.category}
          </p>
        </div>
      </div>
    </div>
  );
};
