import React from 'react';
import { SEOHead } from '../components/seo/SEOHead';
import { PageHeader } from '../components/common/PageHeader';
import { Container } from '../components/common/Container';
import { Section } from '../components/common/Section';
import { SectionHeader } from '../components/common/SectionHeader';
import { Button } from '../components/common/Button';
import { BUSINESS_CONFIG } from '../config/business';
import { MapPin, Navigation, Car, Plane, Phone, ExternalLink } from 'lucide-react';

export const LocationPage: React.FC = () => {
  return (
    <>
      <SEOHead configKey="location" />

      <PageHeader
        title="Location & Directions"
        subtitle="Conveniently situated in Tabokoto, Soma, Lower River Region, The Gambia."
        breadcrumbs={[{ label: 'Location' }]}
        bgTag="Tabokoto, Soma, The Gambia"
      />

      <Section background="default">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Address & Directions details */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-style-label text-[var(--color-secondary)]">
                ESTATE ADDRESS
              </span>
              <h2 className="text-style-h1 text-[var(--color-text)]">
                Tabokoto, Soma
              </h2>
              <p className="text-style-body text-[var(--color-text-muted)] leading-relaxed">
                Kilifa Suites is located in Tabokoto, Soma, in the Lower River Region of The Gambia. Soma is a major transit crossroads linking north-south and east-west trade routes, making our location ideal for regional travel.
              </p>

              <div className="p-6 rounded-2xl bg-[#111111] border border-white/10 shadow-xl space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#C5A059] shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Full Postal Address</h4>
                    <p className="text-xs text-white/70 mt-0.5">
                      {BUSINESS_CONFIG.location.fullAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-white/10">
                  <Navigation className="w-5 h-5 text-[#C5A059] shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-white">GPS Coordinates</h4>
                    <p className="text-xs text-white/70 mt-0.5 font-mono">
                      Lat: {BUSINESS_CONFIG.location.coordinates.lat}° N, Lng: {BUSINESS_CONFIG.location.coordinates.lng}° W
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <Button
                  href={BUSINESS_CONFIG.location.googleMapsUrl}
                  variant="primary"
                  leftIcon={<ExternalLink className="w-4 h-4" />}
                >
                  Open in Google Maps
                </Button>
                <Button
                  href={BUSINESS_CONFIG.contact.whatsappUrl}
                  variant="outline"
                  leftIcon={<Phone className="w-4 h-4" />}
                >
                  Request Driving Directions
                </Button>
              </div>
            </div>

            {/* Right: Map Visual Frame Placeholder */}
            <div className="lg:col-span-6">
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#12241C] border border-[var(--color-border-dark)] p-8 text-white flex flex-col justify-between shadow-xl">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:20px_20px]" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-md bg-[var(--color-primary)] border border-[var(--color-accent)]/40 text-[var(--color-accent)] text-xs font-bold uppercase tracking-wider">
                    SOMA, LOWER RIVER REGIONS
                  </span>
                  <span className="text-xs font-mono text-emerald-300">KILIFA ESTATE</span>
                </div>

                <div className="relative z-10 text-center space-y-3 py-8">
                  <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center mx-auto border border-[var(--color-accent)]/50 animate-bounce">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-white">
                    Kilifa Suites Location Frame
                  </h3>
                  <p className="text-xs text-emerald-200/80 max-w-xs mx-auto">
                    Tabokoto, Soma, Lower River Region, The Gambia
                  </p>
                </div>

                <div className="relative z-10 pt-4 border-t border-emerald-900/60 flex items-center justify-between text-xs text-emerald-300/80 font-mono">
                  <span>Owner: Alhaji Kilifa</span>
                  <span>12 Suites (Houses 1 & 2)</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Transit Distances */}
      <Section background="subtle">
        <Container size="lg">
          <SectionHeader
            eyebrow="Regional Connectivity"
            title="Travel Distances & Landmarks"
            description="Estimated travel times from Kilifa Suites in Soma to major regional transit nodes."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-white border border-[var(--color-border)] shadow-sm space-y-2">
              <span className="text-xs font-bold uppercase text-[var(--color-secondary)]">Landmark 01</span>
              <h4 className="text-base font-bold text-[var(--color-text)]">Soma Commercial Market</h4>
              <p className="text-xs text-[var(--color-text-muted)]">5 mins drive (~2.2 km)</p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[var(--color-border)] shadow-sm space-y-2">
              <span className="text-xs font-bold uppercase text-[var(--color-secondary)]">Landmark 02</span>
              <h4 className="text-base font-bold text-[var(--color-text)]">Senegambia Highway Link</h4>
              <p className="text-xs text-[var(--color-text-muted)]">Direct access road</p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[var(--color-border)] shadow-sm space-y-2">
              <span className="text-xs font-bold uppercase text-[var(--color-secondary)]">Landmark 03</span>
              <h4 className="text-base font-bold text-[var(--color-text)]">Trans-Gambia Senegambia Bridge</h4>
              <p className="text-xs text-[var(--color-text-muted)]">12 mins drive (~9.5 km)</p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[var(--color-border)] shadow-sm space-y-2">
              <span className="text-xs font-bold uppercase text-[var(--color-secondary)]">Landmark 04</span>
              <h4 className="text-base font-bold text-[var(--color-text)]">Banjul International Airport</h4>
              <p className="text-xs text-[var(--color-text-muted)]">Transfers arranged via shuttle</p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
};
