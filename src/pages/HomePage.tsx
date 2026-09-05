import React, { useState } from 'react';
import { SEOHead } from '../components/seo/SEOHead';
import { Container } from '../components/common/Container';
import { Section } from '../components/common/Section';
import { SectionHeader } from '../components/common/SectionHeader';
import { Button } from '../components/common/Button';
import { SuiteCard } from '../components/suites/SuiteCard';
import { ImagePlaceholder } from '../components/common/ImagePlaceholder';
import { VideoPlaceholder } from '../components/common/VideoPlaceholder';
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
  Sparkles,
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
  Heart,
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
    { label: 'Leisure', icon: Sparkles, description: 'Tranquil gardens & relaxed atmosphere' },
    { label: 'Families', icon: Users, description: 'Interconnecting suite options & spacious living' },
    { label: 'Couples', icon: Heart, description: 'Private master suites & secluded terraces' },
    { label: 'Solo Travelers', icon: User, description: 'Secure compound & responsive concierge' },
    { label: 'Groups', icon: Home, description: 'Full 6-suite house bookings available' },
    { label: 'Workshops', icon: Building2, description: 'Meeting lounge space & group facilities' },
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

      {/* HERO SECTION */}
      <section className="relative bg-[#0A0A0A] text-white pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden border-b border-white/10">
        {/* Ambient Subtle Glow */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />

        <Container size="xl" className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-white/5 border border-[#C5A059]/30 text-[#C5A059] text-[10px] font-semibold uppercase tracking-[0.3em]">
                <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Tabokoto, Soma, Lower River Region, The Gambia</span>
              </div>

              <h1 className="text-style-display text-white tracking-tight font-serif italic">
                Your Private Stay in Soma
              </h1>

              <p className="text-style-body text-white/70 text-base sm:text-xl max-w-2xl leading-relaxed font-light">
                Experience comfort, security and modern hospitality at Kilifa Suites.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Button
                  to="/booking"
                  variant="primary"
                  size="lg"
                  leftIcon={<Calendar className="w-4 h-4" />}
                >
                  Book Your Stay
                </Button>

                <Button
                  to="/suites"
                  variant="outline"
                  size="lg"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Explore Our Suites
                </Button>
              </div>

              {/* Key Location Ribbon */}
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>2 Houses • 12 Suites</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>24/7 Solar Backup</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>Gated Compound</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Media Showcase */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-2 rounded-2xl bg-[#111111] border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black">
                  <img
                    src="/images/property/exterior/kilifa-suites-exterior-night-01.jpg"
                    alt="Kilifa Suites Estate Elevation at Night"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded bg-black/80 backdrop-blur-md border border-[#C5A059]/40 text-[#C5A059] text-[10px] font-semibold uppercase tracking-widest flex items-center gap-1.5 z-10">
                    <Sparkles className="w-3 h-3 text-[#C5A059]" />
                    <span>Courtyard & Colonnade View</span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white z-10">
                    <div>
                      <span className="font-serif italic text-sm text-white block">House 1 & House 2 Compound</span>
                      <span className="text-[10px] text-white/70">Tabokoto, Soma, Lower River Region</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#C5A059] text-black font-semibold text-[10px] uppercase">
                      24/7 Gated
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#111111] border border-white/10 flex items-center justify-between text-xs text-white/70">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#C5A059]" />
                  <div>
                    <span className="font-semibold text-white block">Location Address</span>
                    <span>Tabokoto, Soma, Lower River Region, The Gambia</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[#C5A059] font-mono text-[11px] font-bold">
                  Soma, GM
                </span>
              </div>
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
            description="Established by Musa Njie, Kilifa Suites provides contemporary, high-standard accommodation tailored for every traveler visiting Soma and Lower River Region."
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
            <div className="p-3 rounded-2xl bg-[#111111] border border-white/10 shadow-2xl">
              <VideoPlaceholder
                title="Official Kilifa Suites Property & Compound Walkthrough"
                duration="02:45"
                thumbnail="/images/property/exterior/kilifa-suites-courtyard-day-01.jpg"
                onPlayClick={() =>
                  setSelectedVideo({
                    id: 'hero-vid',
                    type: 'video',
                    url: '/videos/property/kilifa-suites-property-tour.mp4',
                    caption: 'Kilifa Suites Official Estate & Compound Walkthrough',
                    alt: 'Kilifa Suites Estate Video',
                    category: 'grounds',
                    duration: '02:45',
                  })
                }
              />
            </div>

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

      {/* LOCATION SECTION */}
      <Section background="surface">
        <Container size="lg">
          <SectionHeader
            eyebrow="Lower River Region Hub"
            title="Location"
            description="Kilifa Suites is located along the main transit axis in Soma, providing convenient access for business and cross-border travel."
          />

          <div className="p-8 rounded-2xl bg-[#161616] border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded bg-white/5 border border-[#C5A059]/40 text-[#C5A059]">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-semibold block">
                    Full Address
                  </span>
                  <span className="text-lg font-serif italic text-white">
                    Tabokoto, Soma, Lower River Region, The Gambia
                  </span>
                </div>
              </div>

              <a
                href={BUSINESS_CONFIG.location.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-[#C5A059] text-[#C5A059] text-xs font-semibold uppercase tracking-widest hover:bg-[#C5A059] hover:text-black transition-colors"
              >
                <span>Open Google Maps</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Google Maps Placeholder */}
            <div className="relative w-full aspect-[21/9] rounded-xl bg-gradient-to-br from-[#111111] via-[#1A1A1A] to-[#0A0A0A] border border-white/10 flex flex-col items-center justify-center p-6 text-center overflow-hidden group">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="relative z-10 flex flex-col items-center max-w-md">
                <div className="w-12 h-12 border border-[#C5A059] text-[#C5A059] flex items-center justify-center mb-3">
                  <MapPin className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-[#C5A059] uppercase tracking-[0.25em] mb-1">
                  [GOOGLE MAPS PLACEHOLDER]
                </span>
                <p className="text-sm font-serif italic text-white">
                  Tabokoto, Soma, Lower River Region, The Gambia
                </p>
                <p className="text-xs text-white/50 mt-1">
                  Convenient access from Trans-Gambia Highway link.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* FINAL CTA SECTION */}
      <Section background="dark">
        <Container size="md" className="text-center">
          <div className="p-8 sm:p-14 rounded-3xl bg-[#111111] border border-[#C5A059]/40 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="relative z-10 space-y-6 max-w-xl mx-auto">
              <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[#C5A059]">
                Reservations & Inquiries
              </span>

              <h2 className="text-style-h1 text-white font-serif italic">
                READY TO STAY WITH US?
              </h2>

              <p className="text-sm text-white/70 leading-relaxed">
                Contact our concierge directly or submit an online booking inquiry to reserve your executive suite at Kilifa Suites in Soma.
              </p>

              <div className="pt-2 flex flex-wrap justify-center gap-4">
                <Button to="/booking" variant="primary" size="lg">
                  Book Your Stay
                </Button>

                <Button to="/contact" variant="secondary" size="lg">
                  Contact Kilifa Suites
                </Button>
              </div>
            </div>
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
