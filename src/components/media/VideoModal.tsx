import React, { useState, useEffect } from 'react';
import { Media } from '../../types';
import {
  X,
  Play,
  Pause,
  Film,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  Clock,
  RotateCcw,
} from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  media?: Media | null;
  video?: Media | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  media,
  video,
  onClose,
}) => {
  const activeMedia = media || video;
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(35);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !activeMedia) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-8 animate-fadeIn">
      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 z-30 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Close Video Player"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="max-w-4xl w-full flex flex-col items-center">
        {/* VIDEO PLAYER VIEWPORT */}
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-[#0F0F0F] via-[#1A1A1A] to-black text-white flex flex-col items-center justify-center p-8 border border-[#C5A059]/40 shadow-2xl relative group">
          {/* Top header badge inside player */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-[#C5A059]/30 text-[#C5A059] text-xs font-semibold">
              <Film className="w-4 h-4" />
              <span>KILIFA SUITES VIDEO PLAYER</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-xs font-mono text-white/70">
              <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{activeMedia.duration || '02:30'}</span>
            </div>
          </div>

          {/* Animated Center Display */}
          <div
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-20 h-20 rounded-full bg-[#C5A059] text-black flex items-center justify-center mb-4 shadow-2xl cursor-pointer hover:scale-110 transition-transform ring-8 ring-[#C5A059]/20"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-serif italic text-center text-white mb-2 max-w-lg">
            {activeMedia.caption}
          </h3>

          <div className="flex items-center gap-2 text-xs text-white/70 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 mt-1">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Interactive Property Video Tour ({activeMedia.category.toUpperCase()})</span>
          </div>

          {/* Bottom Interactive Control Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent space-y-2">
            {/* Timeline Progress Bar */}
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const newProgress = (clickX / rect.width) * 100;
                setProgress(newProgress);
              }}
              className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer overflow-hidden group/bar"
            >
              <div
                className="h-full bg-[#C5A059] relative transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-white/70 font-mono pt-1">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="hover:text-[#C5A059] transition-colors"
                >
                  {isPlaying ? 'PAUSE' : 'PLAY'}
                </button>
                <button
                  type="button"
                  onClick={() => setProgress(0)}
                  className="hover:text-[#C5A059] transition-colors"
                  title="Restart"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <span>
                  {Math.floor((progress / 100) * 150)}s / {activeMedia.duration || '02:30'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="hover:text-[#C5A059] transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center space-y-1">
          <p className="text-sm font-serif italic text-white">{activeMedia.caption}</p>
          <p className="text-xs text-[#C5A059] font-mono uppercase tracking-widest">
            Kilifa Suites • Official Property Video
          </p>
        </div>
      </div>
    </div>
  );
};
