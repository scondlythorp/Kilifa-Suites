import React, { useState } from 'react';
import { SEOHead } from '../components/seo/SEOHead';
import { Container } from '../components/common/Container';
import { Section } from '../components/common/Section';
import { SectionHeader } from '../components/common/SectionHeader';
import { Button } from '../components/common/Button';
import { SuiteCard } from '../components/suites/SuiteCard';
import { ImagePlaceholder } from '../components/common/ImagePlaceholder';
import { MediaCard } from '../components/media/MediaCard';
import { VideoModal } from '../components/media/VideoModal';
import { LightboxModal } from '../components/media/LightboxModal';
import { SUITES_DATA, MEDIA_GALLERY_DATA, BUSINESS_CONFIG } from '../config/business';
import { Media } from '../types';
import {
  Building2,
  ShieldCheck,
  Zap,
  MapPin,
  ArrowRight,
  Phone,
  Calendar,
  Wind,
  Tv,
  Droplet,
  Sun,
  Sofa,
  Lock,
  Shield,
  Car,
  Briefcase,
  Users,
  User,
  Plane,
  Clock,
  CheckCircle2,
  Camera,
  Radio,
  Eye,
  Home,
  Check,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<Media | null>(null);
  const [selectedLightboxMedia, setSelectedLightboxMedia] = useState<Media | null>(null);
  const [heroVideoFailed, setHeroVideoFailed] = useState<boolean>(false);

  // Hero Video Animation State (20-second loop)
  // Featured Suites (using official dataset)
  const featuredSuites = [
    SUITES_DATA[0], // DAR
    SUITES_DATA[1], // SAMA
    SUITES_DATA[6], // SUUDU
    SUITES_DATA[7], // WURO
  ];

  // Gallery preview items
  const galleryPreview = MEDIA_GALLERY_DATA.slice(0, 4);

  // Accommodations target traveler categories
  const targetGuestCategories = [
    { label: 'Business', icon: Briefcase, description: 'Dedicated work tables & fiber Wi-Fi' },
    { label: 'Families', icon: Users, description: 'Interconnecting suite options & spacious living' },
    { label: 'Solo Travelers', icon: User, description: 'Secure compound & responsive concierge' },
    { label: 'Groups', icon: Home, description: 'Full 6-suite house bookings available' },
    { label: 'Transit Stays', icon: Plane, description: 'Convenient Lower River Region hub' },
    { label: 'Emergency Overnight', icon: Clock, description: '24/7 reception & rapid keycard check-in' },
  ];

  // Property Highlights
  const highlights = [
    {
      title: '12 Individual Suites',
      subtitle: 'Two houses with six individually named suites each.',
      icon: Building2,
      detail: 'House 1 & House 2 offer secluded floor plans for total guest privacy.',
    },
    {
      title: 'Spacious Living',
      subtitle: 'Each suite includes a parlor and master bedroom.',
      icon: Sofa,
      detail: 'Separate living room space designed for comfort and relaxed entertaining.',
    },
    {
      title: 'Modern Comfort',
      subtitle: 'Air conditioning, TVs and comfortable interiors.',
      icon: Wind,
      detail: 'Inverter split-system AC, Smart HDTVs, and plush bedding in every suite.',
    },
    {
      title: 'Reliable Utilities',
      subtitle: 'Solar power and 24-hour electricity backup.',
      icon: Zap,
      detail: 'Uninterrupted dual solar power circuit guarantees continuous electricity.',
    },
    {
      title: 'Security',
      subtitle: 'CCTV, electronic access and security systems.',
      icon: ShieldCheck,
      detail: 'Gated compound with 24/7 guard presence and keycard access.',
    },
  ];

  // Amenities list
  const amenitiesList = [
    { name: 'Air conditioning', icon: Wind, desc: 'Individual split-system climate control' },
    { name: 'TV', icon: Tv, desc: 'Smart HDTVs with streaming apps' },
    { name: 'Water', icon: Droplet, desc: 'Pressurized water supply with solar heating' },
    { name: 'Solar', icon: Sun, desc: 'High-capacity eco-friendly solar array' },
    { name: 'Electricity backup', icon: Zap, desc: '24/7 uninterrupted dual solar circuit' },
    { name: 'Hot/cold water', icon: Droplet, desc: 'Solar-heated hot water in all showers' },
    { name: 'Comfortable furniture', icon: Sofa, desc: 'Bespoke living parlor & plush master beds' },
    { name: 'Electronic access', icon: Lock, desc: 'Secure keycard locks on all suite doors' },
    { name: 'Security', icon: Shield, desc: 'Perimeter fencing & round-the-clock guards' },
    { name: 'Reception', icon: UserCheckIcon, desc: 'Dedicated check-in & guest concierge' },
    { name: 'Parking', icon: Car, desc: 'Free secure inside-compound parking' },
  ];

  // Security highlights
  const securityFeatures = [
    { name: '24-hour CCTV', desc: 'Comprehensive high-definition security camera coverage across perimeter and common grounds.' },
    { name: 'Security center', desc: 'Centralized monitoring hub managed by trained security officers.' },
    { name: 'Electrical fencing', desc: 'Reinforced high-security perimeter boundary fencing.' },
    { name: 'Alarm system', desc: 'Rapid response alarm and alert infrastructure.' },
    { name: 'Electronic access', desc: 'Encrypted keycard entry for compound gates and suite doors.' },
    { name: 'Reception/security presence', desc: 'Physical guard presence at the entrance 24 hours a day.' },
  ];

  return (
    <>
      <SEOHead configKey="home" />

      {/* HERO SECTION WITH LOOPING VIDEO BACKGROUND (HERO LOOP) */}
      <section className="relative w-full min-h-[90vh] sm:min-h-screen flex items-center justify-center overflow-hidden border-b border-white/10 bg-[#0A0A0A] text-white">
        {/* Full-Width Background Video or High-Res Image Fallback */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
          {!heroVideoFailed ? (
            <video
              src="/media/videos/kilifa-property-exterior-tour-01.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/media/images/kilifa-property-exterior-01.jpeg"
              onError={() => setHeroVideoFailed(true)}
              onTimeUpdate={(e) => {
                if (e.currentTarget.currentTime >= 23) {
                  e.currentTarget.currentTime = 0;
                }
              }}
              className="w-full h-full object-cover object-center scale-105"
            />
          ) : (
            <img
              src="/media/images/kilifa-property-exterior-01.jpeg"
              alt="Kilifa Suites Exterior in Soma, The Gambia"
              className="w-full h-full object-cover object-center scale-105"
            />
          )}
          {/* Semi-transparent black overlay at 45% for high text contrast and legibility */}
          <div className="absolute inset-0 bg-black/45 z-[1]" />
          {/* Cinematic top & bottom atmospheric gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-black/60 z-[2]" />
          <div className="absolute inset-0 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:32px_32px] opacity-10 z-[2]" />
        </div>

        {/* Subtle Ambient Gold Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[360px] bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none z-[2]" />

        {/* Hero Content Layer Sitting on Top of Video */}
        <Container size="xl" className="relative z-10 pt-32 pb-20 sm:pt-40 sm:pb-28 flex flex-col items-center text-center">
          <div className="max-w-4xl mx-auto flex flex-col items-center space-y-6 sm:space-y-8">
            {/* Location Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-[#C5A059]/40 text-[#C5A059] text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.25em] shadow-2xl">
              <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Tabokoto, Soma, Lower River Region, The Gambia</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif italic text-white tracking-tight leading-[1.08] drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
              Your Private Stay in Soma
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-xl md:text-2xl text-white/90 max-w-2xl font-light leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              Experience comfort, security and modern hospitality at Kilifa Suites.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-5">
              <Button
                to="/booking"
                variant="primary"
                size="lg"
                leftIcon={<Calendar className="w-4 h-4" />}
                className="shadow-2xl shadow-[#C5A059]/25 hover:shadow-[#C5A059]/40 text-base"
              >
                Book Your Stay
              </Button>

              <Button
                to="/suites"
                variant="outline"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="bg-black/50 backdrop-blur-md border-white/30 hover:border-[#C5A059] text-white hover:bg-black/70 text-base"
              >
                Explore Our Suites
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* INTRODUCTION SECTION */}
      <Section background="surface">
        <Container size="lg">
          <SectionHeader
            eyebrow="Hospitality Distinction"
            title="WELCOME TO KILIFA SUITES"
            description="Kilifa Suites provides contemporary, high-standard executive accommodation tailored for every traveler visiting Soma and the Lower River Region."
          />

          <div className="bg-[#161616] border border-white/10 rounded-2xl p-8 sm:p-12 space-y-8">
            <div className="max-w-3xl space-y-4">
              <h3 className="text-xl font-serif italic text-white">
                Contemporary Accommodation Designed for Every Journey
              </h3>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                Whether you are traveling for business, visiting family, conducting workshops, or seeking an emergency overnight stay in Soma, Kilifa Suites offers an oasis of quiet, air-conditioned comfort with 24/7 solar power backup and uncompromised privacy.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-semibold block mb-6">
                Accommodations Catering To:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {targetGuestCategories.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="p-4 rounded-xl bg-[#111111] border border-white/5 hover:border-[#C5A059]/40 transition-colors flex items-start gap-3"
                    >
                      <div className="p-2 rounded bg-white/5 border border-[#C5A059]/30 text-[#C5A059] shrink-0">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-white block">
                          {item.label}
                        </span>
                        <span className="text-[11px] text-white/50 block mt-0.5">
                          {item.description}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* PROPERTY HIGHLIGHTS SECTION */}
      <Section background="default">
        <Container size="xl">
          <SectionHeader
            eyebrow="Estate Architecture"
            title="Property Highlights"
            description="Designed across two private houses, Kilifa Suites combines residential comfort with high-level security and dependable utilities."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="p-8 rounded-2xl bg-[#111111] border border-white/10 hover:border-[#C5A059]/50 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-12 h-12 border border-[#C5A059]/40 bg-white/5 text-[#C5A059] flex items-center justify-center mb-6 group-hover:bg-[#C5A059] group-hover:text-black transition-colors">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-serif italic text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs font-semibold text-[#C5A059] uppercase tracking-wider mb-4">
                      {item.subtitle}
                    </p>
                    <p className="text-xs text-white/60 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* FEATURED SUITES SECTION */}
      <Section background="surface">
        <Container size="xl">
          <SectionHeader
            eyebrow="Executive Accommodations"
            title="Featured Suites"
            description="Discover our fully furnished suites featuring parlor and master bedroom layouts. Each suite is individually named and designed for supreme tranquility."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredSuites.map((suite) => (
              <SuiteCard key={suite.id} suite={suite} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              to="/suites"
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Explore All Suites
            </Button>
          </div>
        </Container>
      </Section>

      {/* EXPERIENCE VIDEO SECTION */}
      <Section background="default">
        <Container size="lg">
          <SectionHeader
            eyebrow="Video Walkthrough"
            title="EXPERIENCE KILIFA SUITES"
            description="Take a visual walkthrough of our estate grounds, private suites, and courtyard residences in Soma."
          />

          <div className="space-y-6">
            <div className="flex justify-center">
              <Button
                to="/gallery"
                variant="outline"
                size="md"
                rightIcon={<Camera className="w-4 h-4" />}
              >
                Explore Our Gallery
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* AMENITIES PREVIEW SECTION */}
      <Section background="subtle">
        <Container size="xl">
          <SectionHeader
            eyebrow="Inclusive Hospitality"
            title="Amenities Preview"
            description="Every suite includes premium utilities and amenities engineered to deliver seamless comfort in Lower River Region."
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {amenitiesList.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-[#111111] border border-white/10 hover:border-[#C5A059]/40 transition-colors flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 border border-[#C5A059]/40 bg-white/5 text-[#C5A059] flex items-center justify-center shrink-0">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-white">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-white/50 leading-tight">
                    {item.desc}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Button
              to="/amenities"
              variant="outline"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              View All Amenities
            </Button>
          </div>
        </Container>
      </Section>

      {/* SECURITY PREVIEW SECTION */}
      <Section background="surface">
        <Container size="lg">
          <SectionHeader
            eyebrow="24/7 Protection"
            title="COMFORT WITH PEACE OF MIND"
            description="Guest safety and privacy are paramount at Kilifa Suites. Our compound is outfitted with multi-layered security infrastructure."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((sec, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#161616] border border-white/10 hover:border-[#C5A059]/50 transition-colors space-y-3"
              >
                <div className="flex items-center gap-2 text-[#C5A059]">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <h4 className="text-sm font-semibold text-white">
                    {sec.name}
                  </h4>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  {sec.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* GALLERY PREVIEW SECTION */}
      <Section background="default">
        <Container size="xl">
          <SectionHeader
            eyebrow="Visual Tour"
            title="Gallery Preview"
            description="Explore selected photography and video highlights showcasing our property exterior, suites, and interior living spaces."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {galleryPreview.map((item) => (
              <MediaCard
                key={item.id}
                media={item}
                onOpenLightbox={(med) => setSelectedLightboxMedia(med)}
                onOpenVideo={(med) => setSelectedVideo(med)}
              />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button
              to="/gallery"
              variant="primary"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              View Gallery
            </Button>
          </div>
        </Container>
      </Section>



      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      {/* Lightbox Modal */}
      {selectedLightboxMedia && (
        <LightboxModal
          media={selectedLightboxMedia}
          isOpen={!!selectedLightboxMedia}
          onClose={() => setSelectedLightboxMedia(null)}
        />
      )}
    </>
  );
};

function UserCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  );
}
