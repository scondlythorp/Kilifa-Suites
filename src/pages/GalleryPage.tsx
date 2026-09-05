import React, { useState, useMemo } from 'react';
import { SEOHead } from '../components/seo/SEOHead';
import { PageHeader } from '../components/common/PageHeader';
import { Container } from '../components/common/Container';
import { Section } from '../components/common/Section';
import { SectionHeader } from '../components/common/SectionHeader';
import { MediaCard } from '../components/media/MediaCard';
import { LightboxModal } from '../components/media/LightboxModal';
import { VideoModal } from '../components/media/VideoModal';
import { ExperienceVideoSection } from '../components/media/ExperienceVideoSection';
import { MEDIA_GALLERY_DATA, SUITES_DATA } from '../config/business';
import { Media } from '../types';
import {
  Filter,
  Image as ImageIcon,
  Film,
  Grid,
  Columns,
  Sparkles,
  Building2,
  ChevronRight,
  Layers,
} from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSuiteId, setSelectedSuiteId] = useState<string>('all');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'masonry'>('masonry');

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);

  // Exact requested categories for Phase 7
  const categories = [
    { id: 'All', label: 'All Media' },
    { id: 'Photos', label: 'Photos' },
    { id: 'Videos', label: 'Videos' },
    { id: 'Exterior', label: 'Exterior' },
    { id: 'Interior', label: 'Interior' },
    { id: 'Suites', label: 'Suites' },
    { id: 'Bedrooms', label: 'Bedrooms' },
    { id: 'Parlors', label: 'Parlors' },
    { id: 'Bathrooms', label: 'Bathrooms' },
    { id: 'Amenities', label: 'Amenities' },
    { id: 'Staff', label: 'Staff' },
    { id: 'Security', label: 'Security' },
    { id: 'Compound', label: 'Compound' },
  ];

  // Filtering Logic based on Category & Selected Suite
  const filteredMedia = useMemo(() => {
    let result = MEDIA_GALLERY_DATA;

    // Filter by category
    if (selectedCategory === 'Photos') {
      result = result.filter((m) => m.type === 'image');
    } else if (selectedCategory === 'Videos') {
      result = result.filter((m) => m.type === 'video');
    } else if (selectedCategory !== 'All') {
      const catLower = selectedCategory.toLowerCase();
      result = result.filter((m) => m.category.toLowerCase() === catLower);
    }

    // Filter by selected suite if specified
    if (selectedSuiteId !== 'all') {
      result = result.filter((m) => m.suiteId === selectedSuiteId);
    }

    return result;
  }, [selectedCategory, selectedSuiteId]);

  const handleOpenLightbox = (media: Media) => {
    const idx = filteredMedia.findIndex((m) => m.id === media.id);
    setActiveMediaIndex(idx !== -1 ? idx : 0);
    setLightboxOpen(true);
  };

  const handleOpenVideo = (media: Media) => {
    const idx = filteredMedia.findIndex((m) => m.id === media.id);
    setActiveMediaIndex(idx !== -1 ? idx : 0);
    setVideoModalOpen(true);
  };

  const handleNextLightbox = () => {
    setActiveMediaIndex((prev) => (prev + 1) % filteredMedia.length);
  };

  const handlePrevLightbox = () => {
    setActiveMediaIndex((prev) => (prev - 1 + filteredMedia.length) % filteredMedia.length);
  };

  const currentActiveMedia = filteredMedia[activeMediaIndex] || null;

  return (
    <>
      <SEOHead configKey="gallery" />

      <PageHeader
        title="Real Property Media & Gallery"
        subtitle="Explore authentic photography, suite interior views, compound security grounds, and cinematic video walkthroughs of Kilifa Suites."
        breadcrumbs={[{ label: 'Gallery' }]}
        bgTag="Kilifa Suites Media Archive"
      />

      {/* CINEMATIC PROPERTY VIDEO SECTION */}
      <ExperienceVideoSection />

      {/* MAIN GALLERY SECTION */}
      <Section background="default">
        <Container size="xl">
          <SectionHeader
            eyebrow="Curated Archive"
            title="REAL PROPERTY GALLERY"
            description="Filter by architectural feature, interior suite layout, or specific suite room media."
          />

          {/* GALLERY CONTROLS BAR */}
          <div className="space-y-4 mb-10">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] flex items-center gap-1.5 mr-2 shrink-0">
                <Filter className="w-3.5 h-3.5" /> Category:
              </span>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-[#C5A059] text-black font-bold shadow-lg'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Suite Specific Filter & Layout Toggle Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#111111] border border-white/10">
              {/* Suite Dropdown Selector */}
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span className="text-xs font-semibold text-white/80 shrink-0">
                  Suite Filter:
                </span>
                <select
                  value={selectedSuiteId}
                  onChange={(e) => setSelectedSuiteId(e.target.value)}
                  className="bg-black text-xs text-white border border-white/20 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="all">All 12 Executive Suites</option>
                  {SUITES_DATA.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (House {s.houseNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid / Masonry Layout Toggle */}
              <div className="flex items-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10 w-full sm:w-auto justify-end">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/50 mr-1">
                  Layout:
                </span>
                <button
                  type="button"
                  onClick={() => setLayoutMode('masonry')}
                  className={`p-2 rounded-lg border text-xs transition-colors flex items-center gap-1.5 ${
                    layoutMode === 'masonry'
                      ? 'bg-[#C5A059]/20 border-[#C5A059] text-[#C5A059]'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                  title="Masonry View"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-bold">Masonry</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLayoutMode('grid')}
                  className={`p-2 rounded-lg border text-xs transition-colors flex items-center gap-1.5 ${
                    layoutMode === 'grid'
                      ? 'bg-[#C5A059]/20 border-[#C5A059] text-[#C5A059]'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-bold">Grid</span>
                </button>
              </div>
            </div>
          </div>

          {/* MEDIA COUNT & ACTIVE FILTERS STATEMENT */}
          <div className="flex items-center justify-between text-xs text-white/50 mb-6 font-mono border-b border-white/5 pb-3">
            <span>
              Showing <strong>{filteredMedia.length}</strong> media assets in "{selectedCategory}"
              {selectedSuiteId !== 'all' && ` • Suite Filter Active`}
            </span>
            <span className="text-[#C5A059] text-[10px] uppercase font-bold tracking-widest">
              Lazy Loaded • High Resolution
            </span>
          </div>

          {/* MEDIA GRID / MASONRY CONTAINER */}
          {filteredMedia.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#111111] border border-white/10 space-y-3">
              <Layers className="w-10 h-10 text-[#C5A059] mx-auto opacity-50" />
              <h3 className="text-base font-serif italic text-white">No media items found</h3>
              <p className="text-xs text-white/60">
                Try selecting "All" or choosing a different category or suite filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedSuiteId('all');
                }}
                className="mt-2 text-xs font-bold text-[#C5A059] underline hover:text-white"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              className={
                layoutMode === 'masonry'
                  ? 'columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6'
                  : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              }
            >
              {filteredMedia.map((item) => (
                <div key={item.id} className="break-inside-avoid">
                  <MediaCard
                    media={item}
                    onOpenLightbox={handleOpenLightbox}
                    onOpenVideo={handleOpenVideo}
                  />
                </div>
              ))}
            </div>
          )}
        </Container>
      </Section>

      {/* LIGHTBOX & VIDEO MODALS */}
      <LightboxModal
        isOpen={lightboxOpen}
        media={currentActiveMedia}
        currentIndex={activeMediaIndex}
        totalCount={filteredMedia.length}
        onClose={() => setLightboxOpen(false)}
        onNext={filteredMedia.length > 1 ? handleNextLightbox : undefined}
        onPrev={filteredMedia.length > 1 ? handlePrevLightbox : undefined}
      />

      <VideoModal
        isOpen={videoModalOpen}
        media={currentActiveMedia}
        onClose={() => setVideoModalOpen(false)}
      />
    </>
  );
};
