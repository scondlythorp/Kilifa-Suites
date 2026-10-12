import React from 'react';
import { SEOHead } from '../components/seo/SEOHead';
import { PageHeader } from '../components/common/PageHeader';
import { Container } from '../components/common/Container';
import { Section } from '../components/common/Section';
import { Button } from '../components/common/Button';
import { GoogleMapEmbed } from '../components/common/GoogleMapEmbed';
import { BUSINESS_CONFIG } from '../config/business';
import { MapPin, Navigation, Phone, ExternalLink } from 'lucide-react';

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

            {/* Right: Interactive Live Google Map */}
            <div className="lg:col-span-6">
              <GoogleMapEmbed
                aspectClass="aspect-square sm:aspect-[4/3] lg:aspect-square"
                heightClass="min-h-[420px]"
                defaultZoom={14}
              />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
};
