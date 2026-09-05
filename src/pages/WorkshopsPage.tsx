import React from 'react';
import { SEOHead } from '../components/seo/SEOHead';
import { PageHeader } from '../components/common/PageHeader';
import { Container } from '../components/common/Container';
import { Section } from '../components/common/Section';
import { SectionHeader } from '../components/common/SectionHeader';
import { Button } from '../components/common/Button';
import { ImagePlaceholder } from '../components/common/ImagePlaceholder';
import {
  Briefcase,
  Zap,
  Wifi,
  Users,
  Calendar,
  Phone,
  CheckCircle2,
  Clock,
  Navigation,
  ShieldCheck,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/business';

export const WorkshopsPage: React.FC = () => {
  return (
    <>
      <SEOHead configKey="workshops" />

      <PageHeader
        title="Workshops, Transit & Overnight Stays"
        subtitle="A quiet, reliable, and secure venue for executive retreats, NGO working groups, and transit travelers in Soma."
        breadcrumbs={[{ label: 'Workshops' }]}
        bgTag="Executive Retreat & Transit Venue"
      />

      <Section background="default">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/5 border border-[#C5A059]/30 text-[#C5A059] text-[10px] font-semibold uppercase tracking-[0.25em]">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>EXECUTIVE FACILITIES</span>
              </div>

              <h2 className="text-style-h1 text-white font-serif italic">
                Focus, Productivity & Infrastructure Power
              </h2>

              <p className="text-style-body text-white/80 text-sm sm:text-base leading-relaxed">
                Hosting a workshop or retreat in Lower River Region requires absolute infrastructure guarantees: continuous electrical power for projection equipment and laptops, high-speed Wi-Fi, and quiet private surroundings.
              </p>

              <p className="text-style-body text-white/60 text-xs sm:text-sm leading-relaxed">
                Kilifa Suites provides an equipped workshop environment for up to 25 participants, complemented by 12 private executive suites across House 1 and House 2 to house facilitators and delegates on-site.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>Uninterrupted 24/7 Solar Power Backup for Laptops & Screens</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>Dedicated High-Speed Wi-Fi Router for Group Video Calls & Docs</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>Custom Catering: Coffee Breaks, Lunches, and Refreshment Packages</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>Electronic Keycard Gated Access & Walled Parking inside Compound</span>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <Button to="/contact" variant="primary" leftIcon={<Briefcase className="w-4 h-4" />}>
                  Inquire About Workshop Booking
                </Button>
                <Button
                  href={BUSINESS_CONFIG.contact.whatsappUrl}
                  variant="outline"
                  leftIcon={<Phone className="w-4 h-4" />}
                >
                  WhatsApp Events Lead
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="p-2 rounded-2xl bg-[#111111] border border-white/10 shadow-2xl overflow-hidden group">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-black">
                  <img
                    src="/images/suites/kilifa-suites-parlor-01.jpg"
                    alt="Kilifa Suites Executive Workshop & Meeting Setup"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-xs text-white">
                    <span className="font-serif italic text-sm text-[#C5A059] block">Executive Workshop Setup</span>
                    <span className="text-[10px] text-white/70">House Parlor & Group Facility Layout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Workshop & Overnight Package Specs */}
      <Section background="subtle">
        <Container size="lg">
          <SectionHeader
            eyebrow="Retreat & Transit Packages"
            title="TAILORED GROUP & OVERNIGHT OPTIONS"
            description="Combine workshop space hire with residential suite stays across House 1 and House 2."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#111111] border border-white/10 space-y-4 shadow-xl">
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#C5A059]">
                Option 01
              </span>
              <h3 className="text-xl font-serif italic text-white">Day Workshop</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Full-day access to workshop lounge, high-speed Wi-Fi, audio/visual presentation setup, and coffee break refreshments for working groups up to 25 people.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#111111] border border-white/10 space-y-4 shadow-xl">
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#C5A059]">
                Option 02
              </span>
              <h3 className="text-xl font-serif italic text-white">Residential Retreat</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Combines daily workshop hall hire with overnight stays across our 12 executive suites (DAR through NDIYA) plus full daily breakfast and 24-hour AC.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#111111] border border-white/10 space-y-4 shadow-xl">
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#C5A059]">
                Option 03
              </span>
              <h3 className="text-xl font-serif italic text-white">Transit & Overnight Stay</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Fast check-in and private suite lodging for travelers in transit along the Tabokoto highway link or needing an immediate overnight stay in Soma.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
};
