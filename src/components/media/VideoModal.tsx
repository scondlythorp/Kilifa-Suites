import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Minimize2,
  Clock,
  RotateCcw,
  Loader2,
} from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  media?: Media | null;
  video?: Media | null;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  media,
  video,
  onClose,
}) => {
  const activeMedia = media || video;

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);

  // Reset states on open/change
  useEffect(() => {
    if (isOpen && activeMedia) {
      setCurrentTime(0);
      setIsPlaying(true);
      setShowControls(true);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [isOpen, activeMedia?.url]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3500);
  };

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleTimelineSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = ratio * duration;
    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {});
  };

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      } else if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
        }
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isOpen, onClose, togglePlay, toggleMute, toggleFullscreen, duration]);

  if (!isOpen || !activeMedia) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const posterUrl = activeMedia.posterImage || activeMedia.thumbnail;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-3 sm:p-6 animate-fadeIn">
      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 z-40 p-2.5 rounded-full bg-white/10 hover:bg-[#C5A059] hover:text-black text-white transition-colors focus:outline-none"
        aria-label="Close Video Player"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="max-w-5xl w-full flex flex-col items-center">
        {/* VIDEO PLAYER VIEWPORT CONTAINER */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
          className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-black text-white border border-[#C5A059]/40 shadow-2xl group select-none"
        >
          {/* REAL HTML5 VIDEO ELEMENT */}
          <video
            ref={videoRef}
            src={activeMedia.url}
            poster={posterUrl}
            playsInline
            autoPlay
            preload="auto"
            onClick={togglePlay}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
              }
            }}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration);
              }
            }}
            onDurationChange={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration);
              }
            }}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
            onEnded={() => {
              setIsPlaying(false);
              setShowControls(true);
            }}
            className="w-full h-full object-contain cursor-pointer"
          />

          {/* Buffering Indicator */}
          {isBuffering && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="p-4 rounded-full bg-black/70 border border-[#C5A059]/40 backdrop-blur-md">
                <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin" />
              </div>
            </div>
          )}

          {/* Top Header Badge Overlay */}
          <div
            className={`absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-[#C5A059]/40 text-[#C5A059] text-[11px] font-semibold tracking-wider">
              <Film className="w-3.5 h-3.5" />
              <span>KILIFA SUITES • {activeMedia.category?.toUpperCase() || 'TOUR'}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-xs font-mono text-white/90">
              <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
          </div>

          {/* Large Center Play / Pause Button Overlay (When Paused) */}
          {!isPlaying && !isBuffering && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 cursor-pointer transition-opacity"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#C5A059] text-black flex items-center justify-center shadow-2xl hover:scale-110 transition-transform ring-8 ring-[#C5A059]/20">
                <Play className="w-10 h-10 fill-current ml-1" />
              </div>
            </div>
          )}

          {/* Bottom Interactive Luxury Control Bar */}
          <div
            className={`absolute bottom-0 left-0 right-0 p-3 sm:p-5 bg-gradient-to-t from-black via-black/90 to-transparent z-20 transition-opacity duration-300 space-y-2.5 ${
              showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Timeline Progress Bar Scrubber */}
            <div
              onClick={handleTimelineSeek}
              className="w-full h-2 sm:h-2.5 bg-white/20 hover:bg-white/30 rounded-full cursor-pointer relative overflow-hidden group/bar transition-all"
              title="Seek"
            >
              {/* Progress fill */}
              <div
                className="h-full bg-gradient-to-r from-[#C5A059] to-[#E3C588] relative transition-[width] duration-75"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Control Bar Buttons & Timers */}
            <div className="flex items-center justify-between text-xs text-white/90 font-mono pt-1">
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white hover:text-[#C5A059] transition-colors"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                </button>

                <button
                  type="button"
                  onClick={handleRestart}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-[#C5A059] transition-colors"
                  title="Restart video"
                  aria-label="Restart"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Time Display */}
                <span className="text-[11px] text-white/80 font-mono tracking-wider">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                {/* Volume Control */}
                <div className="flex items-center gap-1.5 group/vol">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white hover:text-[#C5A059] transition-colors"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-red-400" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 sm:w-20 h-1 bg-white/20 accent-[#C5A059] rounded-lg cursor-pointer"
                    aria-label="Volume Slider"
                  />
                </div>

                {/* Fullscreen Button */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white hover:text-[#C5A059] transition-colors"
                  aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Video Caption & Metadata Below Player */}
        <div className="mt-4 text-center space-y-1 px-4">
          <p className="text-base font-serif italic text-white">{activeMedia.caption}</p>
          <div className="flex items-center justify-center gap-2 text-xs text-[#C5A059] font-mono uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            <span>Kilifa Suites • Soma, The Gambia • Authentic Media</span>
          </div>
        </div>
      </div>
    </div>
  );
};
