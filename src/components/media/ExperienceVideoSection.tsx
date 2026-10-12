import React, { useState } from 'react';
import { Container } from '../common/Container';
import { Section } from '../common/Section';
import { VideoModal } from './VideoModal';
import { Media } from '../../types';
import {
  Play,
  Film,
  Sparkles,
  Volume2,
  Maximize2,
  Clock,
  ShieldCheck,
  Zap,
  Building2,
  CheckCircle2,
} from 'lucide-react';

interface ExperienceVideoSectionProps {
  media?: Media;
}

export const ExperienceVideoSection: React.FC<ExperienceVideoSectionProps> = ({ media }) => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const mainVideo: Media = media || {
    id: 'med-vid-hero-main',
    type: 'video',
    url: '/media/videos/kilifa-complete-property-tour-01.mp4',
    thumbnail: '/media/images/kilifa-property-two-suite-overview-01.jpeg',
    posterImage: '/media/images/kilifa-property-two-suite-overview-01.jpeg',
    caption: 'Official Property Walkthrough: Kilifa Suites Compound & Executive Interiors',
    alt: 'Cinematic Property Tour of Kilifa Suites in Soma',
    category: 'compound',
    duration: '03:15',
  };

  const highlights = [
    { timestamp: '00:30', title: 'Gated Compound Entry & Reception' },
    { timestamp: '01:15', title: 'House 1 & House 2 Executive Suites' },
    { timestamp: '02:00', title: 'Solar Power System & 24/7 Energy Inverters' },
    { timestamp: '02:45', title: 'Private Parlors & Courtyard Terraces' },
  ];

  return (
    <>
      <Section background="dark" className="relative overflow-hidden py-16 sm:py-24 border-y border-white/10">
        {/* Subtle ambient lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#C5A059]/10 rounded-full blur-[120px] pointer-events-none" />

        <Container size="xl">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-[#C5A059]/40 text-[#C5A059] text-[10px] font-semibold uppercase tracking-[0.25em]">
              <Film className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>OFFICIAL PROPERTY FILM</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-serif italic text-white tracking-wide">
              EXPERIENCE KILIFA SUITES
            </h2>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-light">
              Take a cinematic walk through our private 12-suite compound in Tabokoto, Soma. Explore House 1, House 2, private parlors, solar infrastructure, and gated grounds.
            </p>
          </div>

          {/* CINEMATIC VIDEO PLAYER CARD */}
          <div className="max-w-4xl mx-auto">
            <div
              onClick={() => setVideoModalOpen(true)}
              className="relative w-full aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-[#121212] via-[#1A1A1A] to-black border border-[#C5A059]/40 shadow-2xl group cursor-pointer"
            >
              {/* Real Video Thumbnail Image */}
              {mainVideo.thumbnail && (
                <img
                  src={mainVideo.thumbnail}
                  alt={mainVideo.alt || mainVideo.caption}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
                />
              )}
              {/* Background gradient texture / frame */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/40" />

              {/* Top bar controls simulation */}
              <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between text-white/80 text-xs">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] uppercase font-semibold tracking-wider text-[#C5A059]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>4K HDR Property Walkthrough</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-white/70 font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{mainVideo.duration || '03:15'}</span>
                </div>
              </div>

              {/* Center Play Button Overlay */}
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#C5A059] text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300 ring-8 ring-[#C5A059]/20">
                  <Play className="w-10 h-10 fill-current ml-1" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-[#C5A059] uppercase tracking-[0.25em] block">
                    Click to Play Film
                  </span>
                  <h3 className="text-lg sm:text-2xl font-serif italic text-white max-w-lg">
                    {mainVideo.caption}
                  </h3>
                </div>
              </div>

              {/* Bottom bar overlay */}
              <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between text-white/60 text-[10px] font-mono px-4 py-2 rounded-xl bg-black/70 backdrop-blur-md border border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-[#C5A059] font-bold">KILIFA SUITES MEDIA</span>
                  <span>•</span>
                  <span>Tabokoto, Soma</span>
                </div>
                <div className="flex items-center gap-3">
                  <Volume2 className="w-3.5 h-3.5 text-white/80" />
                  <Maximize2 className="w-3.5 h-3.5 text-white/80" />
                </div>
              </div>
            </div>

            {/* Timed Chapters / Highlights below player */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {highlights.map((h, i) => (
                <div
                  key={i}
                  onClick={() => setVideoModalOpen(true)}
                  className="p-3 rounded-xl bg-[#111111] border border-white/10 hover:border-[#C5A059]/40 cursor-pointer transition-all space-y-1"
                >
                  <span className="text-[10px] font-mono font-bold text-[#C5A059] block">
                    {h.timestamp}
                  </span>
                  <p className="text-xs text-white/80 font-medium truncate">
                    {h.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <VideoModal
        isOpen={videoModalOpen}
        media={mainVideo}
        onClose={() => setVideoModalOpen(false)}
      />
    </>
  );
};
