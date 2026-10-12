import React from 'react';
import { SEOHead } from '../components/seo/SEOHead';
import { PageHeader } from '../components/common/PageHeader';
import { Container } from '../components/common/Container';
import { Section } from '../components/common/Section';
import { SectionHeader } from '../components/common/SectionHeader';
import { ImagePlaceholder } from '../components/common/ImagePlaceholder';
import { Button } from '../components/common/Button';
import { BUSINESS_CONFIG, STAFF_DATA } from '../config/business';
import { StaffGrid } from '../components/staff/StaffGrid';
import {
  MapPin,
  Building2,
  Calendar,
  Globe,
  Users,
  HeartHandshake,
  Shirt,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const founder = STAFF_DATA.find((s) => s.role === 'owner') || {
    id: 'stf-founder',
    name: 'Musa Njie',
    title: 'Founder & Proprietor',
    bio: '[FOUNDER MESSAGE]',
    avatar: '[FOUNDER PHOTO]',
    role: 'owner' as const,
  };

  const otherStaff = STAFF_DATA.filter((s) => s.role !== 'owner');

  return (
    <>
      <SEOHead configKey="about" />

      <PageHeader
        title="About Kilifa Suites & Founder Musa Njie"
        subtitle="A contemporary hospitality establishment in Tabokoto, Soma, Lower River Region, The Gambia."
        breadcrumbs={[{ label: 'About Us' }]}
        bgTag="Our Heritage & Vision"
      />

      {/* OUR STORY SECTION */}
      <Section background="default">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/5 border border-[#C5A059]/30 text-[#C5A059] text-[10px] font-semibold uppercase tracking-[0.25em]">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>OUR STORY</span>
              </div>

              <h2 className="text-style-h1 text-white font-serif italic">
                Kilifa Suites in Soma
              </h2>

              <p className="text-style-body text-white/80 text-base sm:text-lg leading-relaxed">
                Kilifa Suites is a contemporary hospitality establishment in Tabokoto, Soma, Lower River Region, The Gambia.
              </p>

              <p className="text-style-body text-white/60 text-sm sm:text-base leading-relaxed">
                Established as a serene guest estate featuring 12 executive suites across 2 secure residences, its vision extends beyond accommodation by supporting:
              </p>

              {/* Core Vision Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#111111] border border-white/10 space-y-2">
                  <div className="p-2 rounded bg-white/5 text-[#C5A059] w-fit border border-[#C5A059]/30">
                    <Globe className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-semibold text-white">Local Tourism</h4>
                  <p className="text-[11px] text-white/60 leading-tight">
                    Promoting Soma and Lower River Region as a destination for business and transit travelers.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#111111] border border-white/10 space-y-2">
                  <div className="p-2 rounded bg-white/5 text-[#C5A059] w-fit border border-[#C5A059]/30">
                    <Users className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-semibold text-white">Youth Employment</h4>
                  <p className="text-[11px] text-white/60 leading-tight">
                    Providing meaningful employment and skill development opportunities for young people.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#111111] border border-white/10 space-y-2">
                  <div className="p-2 rounded bg-white/5 text-[#C5A059] w-fit border border-[#C5A059]/30">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-semibold text-white">Community Growth</h4>
                  <p className="text-[11px] text-white/60 leading-tight">
                    Fostering local economic vitality and sustainable community development.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs text-white/60 font-medium">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C5A059]" />
                  <span>Tabokoto, Soma, The Gambia</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#C5A059]" />
                  <span>2 Houses • 12 Executive Suites</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="p-2 rounded-2xl bg-[#111111] border border-white/10 shadow-2xl overflow-hidden group">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-black">
                  <img
                    src="/media/images/kilifa-property-exterior-01.jpeg"
                    alt="Kilifa Suites Estate Compound and Colonnade"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-xs text-white">
                    <span className="font-serif italic text-sm text-[#C5A059] block">Courtyard Colonnade View</span>
                    <span className="text-[10px] text-white/70">House 1 & House 2 Residences</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* FOUNDER SECTION */}
      <Section background="surface">
        <Container size="lg">
          <SectionHeader
            eyebrow="Leadership & Vision"
            title="FOUNDER"
            description="Established under the leadership of Musa Njie."
          />

          <div className="p-8 sm:p-12 rounded-3xl bg-[#111111] border border-white/10 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5">
              <div className="p-2 rounded-2xl bg-[#161616] border border-white/10 overflow-hidden group">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-black">
                  <img
                    src="/media/images/kilifa-staff-00.jpeg"
                    alt="Musa Njie - Founder & Proprietor"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-xs text-white">
                    <span className="font-serif italic text-sm text-[#C5A059] block">Musa Njie</span>
                    <span className="text-[10px] text-white/70">Founder & Proprietor</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 space-y-6">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-semibold block mb-1">
                  Founder & Proprietor
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif italic text-white">
                  Musa Njie
                </h3>
              </div>

              <div className="p-6 rounded-2xl bg-[#161616] border border-white/10 space-y-3">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold block">
                  Founder Message
                </span>
                <p className="text-sm font-serif italic text-white/90 leading-relaxed">
                  "Kilifa Suites was born out of a desire to create an uncompromising sanctuary in Soma—a place where travelers, families, and professionals can enjoy genuine Gambian hospitality, modern climate comfort, and peaceful privacy backed by 24/7 solar reliability."
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2 text-xs text-white/50">
                <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                <span>Proprietor & Visionary • Kilifa Suites, Soma</span>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* BUSINESS HISTORY SECTION */}
      <Section background="default">
        <Container size="md">
          <SectionHeader
            eyebrow="Chronological Record"
            title="BUSINESS HISTORY"
            description="Milestone records configured below with confirmed dates."
          />

          <div className="p-8 rounded-2xl bg-[#111111] border border-white/10 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Established Field */}
              <div className="p-6 rounded-xl bg-[#161616] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-semibold block">
                    Established:
                  </span>
                  <span className="text-xl font-serif text-[#C5A059] font-bold mt-1 block">
                    {BUSINESS_CONFIG.history.establishmentYear}
                  </span>
                </div>
                <div className="p-3 rounded bg-white/5 border border-white/10 text-[#C5A059]">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>

              {/* Inaugurated Field */}
              <div className="p-6 rounded-xl bg-[#161616] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-semibold block">
                    Inaugurated:
                  </span>
                  <span className="text-xl font-serif text-[#C5A059] font-bold mt-1 block">
                    {BUSINESS_CONFIG.history.inaugurationYear}
                  </span>
                </div>
                <div className="p-3 rounded bg-white/5 border border-white/10 text-[#C5A059]">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
            </div>

            <p className="text-xs text-white/40 text-center italic">
              Official business history records maintained by Kilifa Suites administration.
            </p>
          </div>
        </Container>
      </Section>

      {/* JUFRE BRAND SECTION */}
      <Section background="subtle">
        <Container size="md">
          <div className="p-8 sm:p-10 rounded-2xl bg-[#111111] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-lg">
              <div className="flex items-center gap-2">
                <Shirt className="w-4 h-4 text-[#C5A059]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#C5A059]">
                  Associated Venture
                </span>
              </div>
              <h3 className="text-2xl font-serif italic text-white">
                Jufure
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Musa Njie's clothing brand.
              </p>
            </div>

            <a
              href={BUSINESS_CONFIG.jufre?.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-white/5 border border-[#C5A059]/40 text-[#C5A059] hover:bg-[#C5A059] hover:text-black text-xs font-semibold uppercase tracking-widest transition-colors shrink-0"
            >
              <span>[JUFRE LINK]</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </Container>
      </Section>

      {/* STAFF SECTION */}
      <Section background="surface">
        <Container size="lg">
          <SectionHeader
            eyebrow="Hospitality Team"
            title="STAFF"
            description="Meet the team members providing guest reception, concierge assistance, and estate security."
          />

          <StaffGrid staffList={STAFF_DATA} />

          <div className="mt-12 text-center">
            <Button
              to="/booking"
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Book Your Stay at Kilifa Suites
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
};
