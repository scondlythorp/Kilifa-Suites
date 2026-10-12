import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEOHead } from '../components/seo/SEOHead';
import { Container } from '../components/common/Container';
import { Section } from '../components/common/Section';
import { Button } from '../components/common/Button';
import { ImagePlaceholder } from '../components/common/ImagePlaceholder';
import { VideoPlaceholder } from '../components/common/VideoPlaceholder';
import { ErrorState } from '../components/common/ErrorState';
import { LightboxModal } from '../components/media/LightboxModal';
import { VideoModal } from '../components/media/VideoModal';
import { SUITES_DATA, BUSINESS_CONFIG } from '../config/business';
import { Media } from '../types';
import { formatNightlyRate, formatGMD } from '../utils/currency';
import {
  Users,
  Bed,
  Bath,
  CheckCircle2,
  Calendar,
  Key,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Sofa,
  Zap,
  Wind,
  ShieldCheck,
  Video,
  Eye,
  Lock,
} from 'lucide-react';

export const SuiteDetailPage: React.FC = () => {
  const { suiteSlug } = useParams<{ suiteSlug: string }>();
  const suite = SUITES_DATA.find((s) => s.slug === suiteSlug || s.id === suiteSlug);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Media | null>(null);

  if (!suite) {
    return (
      <Container size="md" className="py-24">
        <ErrorState
          title="Suite Not Found"
          message={`The requested suite "${suiteSlug}" could not be located in our official catalog. Please explore our full inventory of executive suites (DAR, SAMA, LAAWOL, EJAM, YERMANDE, BAJAM, SUUDU, WURO, YIDI, KENE, SAGO, NDIYA).`}
        />
        <div className="mt-8 text-center">
          <Button to="/suites" variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to All Suites
          </Button>
        </div>
      </Container>
    );
  }

  const handleOpenGalleryItem = (caption: string, idx: number) => {
    setSelectedMedia({
      id: `suite-gallery-${suite.id}-${idx}`,
      type: 'image',
      url: suite.galleryImages[idx] || suite.featuredImage,
      caption: `${suite.name} - ${caption}`,
      alt: suite.name,
      category: 'suites',
    });
    setLightboxOpen(true);
  };

  return (
    <>
      <SEOHead
        customSEO={{
          title: `${suite.name} | Kilifa Suites, Soma`,
          description: `Detailed specifications for ${suite.name} in House ${suite.houseNumber} at Kilifa Suites, Tabokoto, Soma, Lower River Region, The Gambia.`,
          canonicalPath: `/suites/${suite.slug}`,
        }}
      />

      {/* Hero Header */}
      <div className="bg-[#0A0A0A] text-white pt-28 pb-16 sm:pt-36 sm:pb-20 border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />

        <Container size="xl" className="relative z-10">
          <nav className="flex items-center gap-2 text-xs text-white/50 mb-6 uppercase tracking-widest font-semibold">
            <Link to="/" className="hover:text-[#C5A059] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-white/30" />
            <Link to="/suites" className="hover:text-[#C5A059] transition-colors">
              Suites
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-white/30" />
            <span className="text-[#C5A059]">{suite.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/5 border border-[#C5A059]/30 text-[#C5A059] text-[10px] font-semibold uppercase tracking-[0.25em]">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>House {suite.houseNumber} • Suite {suite.suiteNumber} • {suite.floor}</span>
              </div>

              <h1 className="text-style-h1 text-white font-serif italic tracking-tight">
                {suite.name}
              </h1>

              <p className="text-style-body text-white/70 text-base sm:text-lg max-w-2xl leading-relaxed">
                {suite.description}
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col items-start lg:items-end">
              <div className="px-3 py-1 rounded bg-black/60 border border-[#C5A059]/30 text-[#C5A059] text-[10px] font-semibold uppercase tracking-widest mb-2">
                Availability: Ready for Booking
              </div>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">
                Nightly Reservation Rate
              </span>
              <div className="flex items-baseline gap-1 my-1">
                <span className="text-3xl font-bold text-[#C5A059] font-serif">
                  {formatGMD(suite.pricePerNight)}
                </span>
                <span className="text-xs font-semibold text-white/50">/ night</span>
              </div>

              <Button
                to={`/booking?suite=${suite.slug}`}
                variant="primary"
                size="lg"
                className="mt-3 w-full sm:w-auto"
                leftIcon={<Calendar className="w-4 h-4" />}
              >
                Book {suite.name}
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Section background="default">
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Media & Architectural Breakdown */}
            <div className="lg:col-span-8 space-y-12">
              {/* Featured Visual Frame */}
              <div
                onClick={() => handleOpenGalleryItem('Main Architecture Frame', 0)}
                className="cursor-pointer group rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative aspect-video bg-[#1A1A1A]"
              >
                {suite.featuredImage && !suite.featuredImage.includes('placeholder') ? (
                  <>
                    <img
                      src={suite.featuredImage}
                      alt={suite.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                    <div className="absolute top-4 left-4 px-3 py-1 rounded bg-[#0A0A0A]/90 border border-[#C5A059]/40 text-[#C5A059] text-[10px] font-semibold uppercase tracking-[0.2em] backdrop-blur-md">
                      House {suite.houseNumber} • Suite {suite.suiteNumber}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                      <span className="font-serif italic text-base text-white">{suite.name} Interior Elevation</span>
                      <span className="text-[10px] uppercase font-mono text-[#C5A059] bg-black/60 px-2 py-1 rounded border border-white/10">
                        Click to Expand
                      </span>
                    </div>
                  </>
                ) : (
                  <ImagePlaceholder
                    title={`${suite.name} Interior Elevation`}
                    subtitle={`House ${suite.houseNumber} • ${suite.view}`}
                    aspectRatio="video"
                    houseBadge={suite.houseNumber}
                    suiteNumber={suite.suiteNumber}
                  />
                )}
              </div>

              {/* Photo Gallery & Lightbox */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-serif italic text-white">
                    Suite Photo Gallery
                  </h3>
                  <span className="text-[10px] text-[#C5A059] font-semibold uppercase tracking-widest">
                    Click image to open lightbox
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {suite.galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleOpenGalleryItem(`Gallery View 0${idx + 1}`, idx)}
                      className="cursor-pointer rounded-xl overflow-hidden border border-white/10 hover:border-[#C5A059] transition-all group aspect-square relative bg-[#161616]"
                    >
                      {img && !img.includes('placeholder') ? (
                        <>
                          <img
                            src={img}
                            alt={`${suite.name} Gallery View 0${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </>
                      ) : (
                        <ImagePlaceholder
                          title={`${suite.name} 0${idx + 1}`}
                          subtitle="Expand"
                          aspectRatio="square"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Suite Video Walkthrough Player */}
              <div className="p-6 rounded-2xl bg-[#111111] border border-white/10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-white/5 border border-[#C5A059]/40 text-[#C5A059]">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif italic text-white">
                      Suite Video Tour
                    </h3>
                    <p className="text-xs text-white/50">
                      High-definition walkthrough of parlor, master bedroom, and bathroom.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {suite.videos?.map((vid) => (
                    <VideoPlaceholder
                      key={vid.id}
                      title={vid.caption}
                      duration={vid.duration}
                      thumbnail={vid.thumbnail}
                      onPlayClick={() => setSelectedVideo(vid)}
                    />
                  ))}
                </div>
              </div>

              {/* Architectural Layout Modules: Bedroom, Parlor, Bathroom */}
              <div className="space-y-6">
                <h3 className="text-xl font-serif italic text-white">
                  Suite Layout & Interior Spaces
                </h3>

                {/* Master Bedroom Card */}
                <div className="p-6 rounded-2xl bg-[#111111] border border-white/10 space-y-3">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                    <div className="p-2 rounded bg-white/5 border border-[#C5A059]/30 text-[#C5A059]">
                      <Bed className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-serif italic text-white">
                        Master Bedroom
                      </h4>
                      <span className="text-[10px] text-[#C5A059] uppercase tracking-widest font-semibold block">
                        {suite.bedType} • Climate Controlled
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {suite.masterBedroomDescription}
                  </p>
                </div>

                {/* Parlor Card */}
                <div className="p-6 rounded-2xl bg-[#111111] border border-white/10 space-y-3">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                    <div className="p-2 rounded bg-white/5 border border-[#C5A059]/30 text-[#C5A059]">
                      <Sofa className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-serif italic text-white">
                        Private Living Parlor
                      </h4>
                      <span className="text-[10px] text-[#C5A059] uppercase tracking-widest font-semibold block">
                        Upholstered Seating • Workstation Desk
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {suite.parlorDescription}
                  </p>
                </div>

                {/* Bathroom Card */}
                <div className="p-6 rounded-2xl bg-[#111111] border border-white/10 space-y-3">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                    <div className="p-2 rounded bg-white/5 border border-[#C5A059]/30 text-[#C5A059]">
                      <Bath className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-serif italic text-white">
                        En-suite Bathroom
                      </h4>
                      <span className="text-[10px] text-[#C5A059] uppercase tracking-widest font-semibold block">
                        Solar Hot Water • Pressure Shower
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {suite.bathroomDescription}
                  </p>
                </div>
              </div>

              {/* Specifications Matrix */}
              <div className="p-6 rounded-2xl bg-[#111111] border border-white/10 space-y-6">
                <h3 className="text-lg font-serif italic text-white">
                  Suite Floor Specifications
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-4 border-y border-white/10 text-xs">
                  <div>
                    <span className="text-[10px] text-white/40 block uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#C5A059]" /> Capacity
                    </span>
                    <span className="font-semibold text-white">
                      Up to {suite.maxOccupancy} Guests
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-white/40 block uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-[#C5A059]" /> Bed Setup
                    </span>
                    <span className="font-semibold text-white">
                      {suite.bedType}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-white/40 block uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Bath className="w-3.5 h-3.5 text-[#C5A059]" /> Bathrooms
                    </span>
                    <span className="font-semibold text-white">
                      {suite.bathrooms} En-suite
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-white/40 block uppercase tracking-widest mb-1">
                      Floor Area
                    </span>
                    <span className="font-semibold text-white">
                      {suite.sizeSqM} m²
                    </span>
                  </div>
                </div>

                <div className="text-xs text-white/60 space-y-1">
                  <p>
                    <strong className="text-white">Estates View:</strong> {suite.view}
                  </p>
                  <p>
                    <strong className="text-white">Floor Position:</strong> {suite.floor} in House {suite.houseNumber}
                  </p>
                </div>
              </div>

              {/* Amenities Checklist */}
              <div className="p-6 rounded-2xl bg-[#111111] border border-white/10 space-y-4">
                <h3 className="text-lg font-serif italic text-white">
                  Included Base Amenities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {suite.baseAmenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-white/80">
                      <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Keycard Box */}
              <div className="p-6 rounded-xl bg-white/5 border border-white/10 flex items-start gap-4">
                <div className="w-10 h-10 border border-[#C5A059]/40 bg-white/5 text-[#C5A059] flex items-center justify-center shrink-0 mt-1">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Integrated Keycard Access Control
                  </h4>
                  <p className="text-xs text-white/60 mt-1 leading-relaxed">
                    Upon arrival at reception, guests assigned to {suite.name} are issued an encoded security keycard giving encrypted access to compound gates and suite doors.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Direct Reservation Summary */}
            <div className="lg:col-span-4 space-y-6">
              <div className="sticky top-28 p-6 rounded-2xl bg-[#111111] border border-white/10 shadow-2xl space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C5A059]">
                    Direct Reservation Summary
                  </span>
                  <h3 className="text-lg font-serif italic text-white mt-1">
                    Reserve {suite.name}
                  </h3>
                </div>

                <div className="space-y-3 text-xs text-white/70">
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span>Building Residence:</span>
                    <span className="font-semibold text-white">House {suite.houseNumber}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span>Max Occupancy:</span>
                    <span className="font-semibold text-white">{suite.maxOccupancy} Persons</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span>Power Guarantee:</span>
                    <span className="font-semibold text-[#C5A059]">24/7 Solar Backup</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span>Availability Status:</span>
                    <span className="font-semibold text-[#C5A059]">Ready for Booking</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span>Nightly Rate:</span>
                    <span className="font-bold text-[#C5A059] text-base">{formatNightlyRate(suite.pricePerNight)}</span>
                  </div>
                </div>

                <Button
                  to={`/booking?suite=${suite.slug}`}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  leftIcon={<Calendar className="w-4 h-4" />}
                >
                  Book Your Stay
                </Button>

                <div className="text-center pt-2">
                  <a
                    href={BUSINESS_CONFIG.contact.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#C5A059] hover:underline"
                  >
                    Need instant booking assistance via WhatsApp?
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Lightbox Modal */}
      <LightboxModal
        isOpen={lightboxOpen}
        media={selectedMedia}
        onClose={() => setLightboxOpen(false)}
      />

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </>
  );
};
