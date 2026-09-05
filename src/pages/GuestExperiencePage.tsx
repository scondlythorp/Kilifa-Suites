import React from 'react';
import { SEOHead } from '../components/seo/SEOHead';
import { PageHeader } from '../components/common/PageHeader';
import { Container } from '../components/common/Container';
import { Section } from '../components/common/Section';
import { SectionHeader } from '../components/common/SectionHeader';
import { Button } from '../components/common/Button';
import { ImagePlaceholder } from '../components/common/ImagePlaceholder';
import {
  Users,
  Heart,
  Baby,
  User,
  Briefcase,
  GraduationCap,
  Navigation,
  Sparkles,
  Calendar,
  Phone,
  Clock,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Zap,
  Key,
} from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/business';

export const GuestExperiencePage: React.FC = () => {
  const guestTypes = [
    {
      title: 'Couples',
      icon: Heart,
      description: 'Private executive suites featuring king beds, plush parlor sofas, mood lighting, and serene terrace views for romantic, quiet retreats.',
      highlight: 'King Bed & Private Parlor',
    },
    {
      title: 'Families',
      icon: Users,
      description: 'Spacious multi-bedroom suite combinations across House 1 and House 2 with full living areas for comfortable family visits.',
      highlight: 'Multi-Bedroom Layouts',
    },
    {
      title: 'Children',
      icon: Baby,
      description: 'Enclosed, gated estate environment with round-the-clock perimeter security, safe courtyard spaces, and family-friendly amenities.',
      highlight: 'Safe Gated Compound',
    },
    {
      title: 'Solo Travelers',
      icon: User,
      description: 'Peaceful, secure private suites with dedicated workstation desks, fiber Wi-Fi, and 24/7 reception assistance.',
      highlight: 'Workstation & Fiber Wi-Fi',
    },
    {
      title: 'Groups',
      icon: Users,
      description: 'Block reservations of adjacent suites or full house buyouts for extended families, delegations, or tour groups visiting Soma.',
      highlight: 'Block Suite Buyouts',
    },
    {
      title: 'Business Travelers',
      icon: Briefcase,
      description: 'Uninterrupted 24-hour electricity backup, desk workstations, and quiet parlor environments for calls and corporate productivity.',
      highlight: '24/7 Solar Power Backup',
    },
    {
      title: 'Workshop Participants',
      icon: GraduationCap,
      description: 'Dedicated lounge and workshop hall facilities combined with on-site suite lodging for delegates attending regional sessions.',
      highlight: 'Workshop Hall Access',
    },
    {
      title: 'Transit Travelers',
      icon: Navigation,
      description: 'Strategically situated in Tabokoto on Soma\'s main highway link, providing easy parking, fast check-in, and cross-river travel access.',
      highlight: 'Highway Link Location',
    },
  ];

  return (
    <>
      <SEOHead configKey="guestExperience" />

      <PageHeader
        title="Tailored Guest Experience & Accommodations"
        subtitle="Designed to serve every traveler profile visiting Soma and Lower River Region."
        breadcrumbs={[{ label: 'Guest Experience' }]}
        bgTag="The Kilifa Standard"
      />

      {/* GUEST TYPES SECTION */}
      <Section background="default">
        <Container size="xl">
          <SectionHeader
            eyebrow="Tailored Hospitality"
            title="ACCOMMODATING EVERY GUEST TYPE"
            description="Kilifa Suites caters to diverse travel needs with tailored suite setups, compound privacy, and dedicated guest services."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {guestTypes.map((gt, idx) => {
              const IconComp = gt.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#111111] border border-white/10 hover:border-[#C5A059]/50 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="w-10 h-10 border border-[#C5A059]/40 text-[#C5A059] bg-white/5 flex items-center justify-center rounded">
                      <IconComp className="w-5 h-5 text-[#C5A059]" />
                    </div>

                    <div>
                      <h3 className="text-lg font-serif italic text-white group-hover:text-[#C5A059] transition-colors">
                        {gt.title}
                      </h3>
                      <span className="text-[10px] font-semibold text-[#C5A059] uppercase tracking-widest block mt-0.5">
                        {gt.highlight}
                      </span>
                    </div>

                    <p className="text-xs text-white/60 leading-relaxed">
                      {gt.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center gap-1 text-[10px] text-white/40 font-semibold uppercase tracking-widest">
                    <span>Kilifa Suites Feature</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* WORKSHOPS & EMERGENCY STAYS SECTION */}
      <Section background="subtle">
        <Container size="lg">
          <SectionHeader
            eyebrow="Specialized Lodging"
            title="WORKSHOPS, TRANSIT & OVERNIGHT STAYS"
            description="Reliable lodging solutions for delegates, highway transit travelers, and short-notice overnight guests in Soma."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="p-8 rounded-2xl bg-[#111111] border border-white/10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded bg-white/5 border border-[#C5A059]/40 text-[#C5A059]">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif italic text-white">
                      Flexibility for Workshops & Overnight Stays
                    </h3>
                    <p className="text-xs text-white/50">
                      Tabokoto, Soma • Lower River Region
                    </p>
                  </div>
                </div>

                <p className="text-xs text-white/80 leading-relaxed">
                  Kilifa Suites is uniquely structured to accommodate guests attending workshops and training programs in Lower River Region, travelers in transit along the main highway corridors, and individuals needing an urgent or short-notice overnight stay.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 text-xs text-white/80">
                    <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                    <span><strong>Workshop Participants:</strong> Dedicated meeting lounge space, high-speed Wi-Fi, and residential lodging for facilitators and attendees.</span>
                  </div>

                  <div className="flex items-start gap-3 text-xs text-white/80">
                    <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                    <span><strong>Travelers in Transit:</strong> Convenient location along the Tabokoto highway link, secure gated parking, and swift electronic keycard check-in.</span>
                  </div>

                  <div className="flex items-start gap-3 text-xs text-white/80">
                    <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                    <span><strong>Overnight Stays:</strong> Round-the-clock reception to welcome guests arriving on late journeys or needing a night's rest in Soma.</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 space-y-1">
                  <p className="font-semibold text-[#C5A059] uppercase tracking-widest text-[10px]">
                    Infrastructure Guarantee
                  </p>
                  <p>
                    All overnight and workshop stays benefit from 24-hour solar electricity backup, silent air conditioning, continuous water supply, and gated compound security.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap gap-4">
                  <Button to="/workshops" variant="primary" leftIcon={<GraduationCap className="w-4 h-4" />}>
                    Explore Workshop Venue
                  </Button>
                  <Button to="/booking" variant="outline" leftIcon={<Calendar className="w-4 h-4" />}>
                    Book Overnight Stay
                  </Button>
                </div>
              </div>

              {/* Electronic Key Card Status Checker */}
              <div className="p-8 rounded-2xl bg-[#0B101D] border border-white/10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded bg-white/5 border border-[#C5A059]/40 text-[#C5A059]">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif italic text-white">
                      Guest Electronic Key Card & Access Control
                    </h3>
                    <p className="text-xs text-white/50">
                      SALTO Systems RFID & Digital Mobile Key Token Engine
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs font-mono text-white/80">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-[#C5A059] font-bold">Lock Hardware System:</span>
                    <span className="text-white">SALTO XS4 Original Escutcheon</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-[#C5A059] font-bold">Card Technology:</span>
                    <span className="text-white">RFID MIFARE DESFire EV2 (13.56 MHz)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#C5A059] font-bold">Access Protocol:</span>
                    <span className="text-white">TCP/IP RF Mesh Gateway Sync</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="p-2 rounded-2xl bg-[#111111] border border-white/10 shadow-2xl overflow-hidden group">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-black">
                  <img
                    src="/images/suites/kilifa-suites-parlor-02-wide.jpg"
                    alt="Workshop & Executive Transit Lounge at Kilifa Suites"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-xs text-white">
                    <span className="font-serif italic text-sm text-[#C5A059] block">Workshop & Transit Lounge</span>
                    <span className="text-[10px] text-white/70">Executive Facilities in Soma</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#111111] border border-white/10 text-xs text-white/70 space-y-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C5A059] block">
                  Direct Assistance
                </span>
                <p>
                  Need immediate overnight lodging or group workshop reservation assistance in Soma? Contact our 24/7 reception desk:
                </p>
                <div className="pt-1">
                  <a
                    href={BUSINESS_CONFIG.contact.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#C5A059] font-bold hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    <span>WhatsApp Concierge: {BUSINESS_CONFIG.contact.phoneFormatted}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
};
