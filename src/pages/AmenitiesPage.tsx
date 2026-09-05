import React, { useState } from 'react';
import { SEOHead } from '../components/seo/SEOHead';
import { PageHeader } from '../components/common/PageHeader';
import { Container } from '../components/common/Container';
import { Section } from '../components/common/Section';
import { SectionHeader } from '../components/common/SectionHeader';
import { AmenityCard } from '../components/amenities/AmenityCard';
import { AMENITIES_DATA } from '../config/business';
import { Button } from '../components/common/Button';
import {
  Zap,
  ShieldCheck,
  Calendar,
  Sparkles,
  Wind,
  Tv,
  Sofa,
  Layers,
  Palette,
  Droplets,
  Flame,
  Sun,
  ConciergeBell,
  Car,
  Compass,
  Key,
} from 'lucide-react';

export const AmenitiesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Climate & Comfort', 'Entertainment', 'Interior Finishes', 'Power Reliability', 'Estate Infrastructure', 'Guest Services', 'Security & Control'];

  const filteredAmenities = selectedCategory === 'All'
    ? AMENITIES_DATA
    : AMENITIES_DATA.filter(a => a.category === selectedCategory);

  return (
    <>
      <SEOHead configKey="amenities" />

      <PageHeader
        title="Estate Amenities & Facilities"
        subtitle="Uncompromised infrastructure, climate comfort, and electronic security in Tabokoto, Soma."
        breadcrumbs={[{ label: 'Amenities' }]}
        bgTag="Kilifa Suites Specifications"
      />

      {/* Main Amenities Section */}
      <Section background="default">
        <Container size="xl">
          <SectionHeader
            eyebrow="Confirmed Facilities"
            title="Comprehensive Suite & Estate Features"
            description="Every suite across House 1 and House 2 is built with modern climate control, backup solar power, and electronic access systems."
          />

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#C5A059] text-black font-bold shadow'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Amenities Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAmenities.map((amenity) => (
              <AmenityCard key={amenity.id} amenity={amenity} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Deep-Dive Power, Climate & Access Feature Callouts */}
      <Section background="subtle">
        <Container size="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Solar Power Highlight */}
            <div className="p-8 rounded-2xl bg-[#111111] border border-white/10 space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded bg-white/5 border border-[#C5A059]/40 text-[#C5A059] flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif italic text-white">
                24-Hour Electricity & Solar System
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Power stability is central to your comfort. Kilifa Suites combines a high-capacity solar array with instant battery storage backup, ensuring silent 24-hour electricity for air conditioning, lighting, smart HDTVs, and high-speed Wi-Fi.
              </p>
              <div className="pt-2 text-xs text-[#C5A059] font-semibold bg-white/5 p-3 rounded border border-[#C5A059]/30 flex items-center gap-2">
                <Sun className="w-4 h-4 shrink-0 text-[#C5A059]" />
                <span>Zero blackout risk for all 12 executive suites.</span>
              </div>
            </div>

            {/* Perimeter & Electronic Access Highlight */}
            <div className="p-8 rounded-2xl bg-[#111111] border border-white/10 space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded bg-white/5 border border-[#C5A059]/40 text-[#C5A059] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif italic text-white">
                Electronic Guest Access & Security
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Guest privacy and safety are maintained through enclosed gated compound fencing, 24-hour reception and security teams, and encrypted electronic RFID keycard access control for every suite door and compound gate.
              </p>
              <div className="pt-2 text-xs text-[#C5A059] font-semibold bg-white/5 p-3 rounded border border-[#C5A059]/30 flex items-center gap-2">
                <Key className="w-4 h-4 shrink-0 text-[#C5A059]" />
                <span>Private, gated residence exclusively for registered guests.</span>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button to="/booking" variant="primary" size="lg" leftIcon={<Calendar className="w-4 h-4" />}>
              Reserve a Suite at Kilifa Suites
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
};
