import React, { useState } from 'react';
import { SEOHead } from '../components/seo/SEOHead';
import { PageHeader } from '../components/common/PageHeader';
import { Container } from '../components/common/Container';
import { Section } from '../components/common/Section';
import { SectionHeader } from '../components/common/SectionHeader';
import { Button } from '../components/common/Button';
import { ImagePlaceholder } from '../components/common/ImagePlaceholder';
import { AccessCard } from '../types';
import {
  ShieldCheck,
  Video,
  Zap,
  BellRing,
  UserCheck,
  Key,
  CheckCircle2,
  Lock,
  ArrowDown,
  Info,
  Calendar,
  Clock,
  Sparkles,
  Layers,
  Code2,
  ShieldAlert,
  Server,
  Building2,
} from 'lucide-react';

export const SecurityPage: React.FC = () => {
  // Sample Access Cards showcasing the TypeScript AccessCard data structure
  const sampleCards: AccessCard[] = [
    {
      id: 'card-001',
      bookingId: 'BK-2026-8801',
      guestId: 'GST-9921',
      cardIdentifier: 'KC-7729-01',
      suiteId: 'suite-01',
      suiteName: 'DAR',
      activatedAt: '2026-08-09T14:00:00Z',
      expiresAt: '2026-08-12T11:00:00Z',
      status: 'active',
    },
    {
      id: 'card-002',
      bookingId: 'BK-2026-8802',
      guestId: 'GST-9922',
      cardIdentifier: 'KC-7729-02',
      suiteId: 'suite-07',
      suiteName: 'SUUDU',
      activatedAt: '2026-08-01T12:00:00Z',
      expiresAt: '2026-08-05T11:00:00Z',
      status: 'expired',
    },
    {
      id: 'card-003',
      bookingId: 'BK-2026-8803',
      guestId: 'GST-9923',
      cardIdentifier: 'KC-7729-03',
      suiteId: 'suite-04',
      suiteName: 'EJAM',
      activatedAt: '2026-08-15T14:00:00Z',
      expiresAt: '2026-08-18T11:00:00Z',
      status: 'pending',
    },
  ];

  const [activeTabCard, setActiveTabCard] = useState<AccessCard>(sampleCards[0]);

  const securityFeatures = [
    {
      title: '24-Hour CCTV Monitoring',
      icon: Video,
      description: 'Continuous high-definition infrared video surveillance covering perimeter walls, main entry gates, vehicle parking areas, and courtyard walkways.',
      badge: 'Surveillance',
    },
    {
      title: 'Security Center',
      icon: Server,
      description: 'Centralized security monitoring station located on estate grounds, continuously manned by trained surveillance and safety officers.',
      badge: 'Operations',
    },
    {
      title: 'Electrical Fencing',
      icon: Zap,
      description: 'Top-mounted perimeter electrical security fence lining the entire compound wall, providing robust physical and deterrence security.',
      badge: 'Perimeter',
    },
    {
      title: 'Alarm & Intrusion Security System',
      icon: BellRing,
      description: 'Integrated emergency perimeter intrusion detection systems linked directly to the central security desk and local authorities.',
      badge: 'Alert System',
    },
    {
      title: 'Reception & Security Presence',
      icon: UserCheck,
      description: '24/7 uniformed guard presence at compound entry gates combined with friendly reception staff verifying guest authorizations.',
      badge: '24/7 Staff',
    },
    {
      title: 'Electronic Guest Access Cards',
      icon: Key,
      description: 'Encrypted RFID keycards issued to verified guests upon arrival, authorizing controlled access to gates and individual private suites.',
      badge: 'Access Control',
    },
  ];

  const conceptSteps = [
    {
      number: '01',
      title: 'Guest Checks In',
      description: 'Guest arrives at reception; identity and reservation details are confirmed by estate staff.',
      icon: UserCheck,
    },
    {
      number: '02',
      title: 'Electronic Access Card Activated',
      description: 'An RFID electronic keycard is encoded with authorized stay duration and assigned suite credentials.',
      icon: Key,
    },
    {
      number: '03',
      title: 'Card Works During Authorized Stay',
      description: 'The keycard unlocks compound entry gates and private suite doors throughout the duration of the stay.',
      icon: Lock,
    },
    {
      number: '04',
      title: 'Checkout',
      description: 'Guest completes checkout at reception upon conclusion of their stay.',
      icon: Calendar,
    },
    {
      number: '05',
      title: 'Access Authorization Expires',
      description: 'The keycard authorization automatically de-activates, ensuring security for incoming guests.',
      icon: ShieldAlert,
    },
  ];

  return (
    <>
      <SEOHead configKey="security" />

      <PageHeader
        title="Security & Electronic Guest Access"
        subtitle="Multi-layered perimeter defense, 24/7 CCTV surveillance, and RFID electronic keycard control in Tabokoto, Soma."
        breadcrumbs={[{ label: 'Security' }]}
        bgTag="Comprehensive Estate Defense"
      />

      {/* CORE HIGHLIGHTS GRID */}
      <Section background="default">
        <Container size="xl">
          <SectionHeader
            eyebrow="Gated Protection"
            title="ESTATE SECURITY HIGHLIGHTS"
            description="Kilifa Suites combines physical fencing, electronic monitoring, and trained personnel to ensure guest tranquility."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feat, idx) => {
              const IconComponent = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#111111] border border-white/10 hover:border-[#C5A059]/50 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 border border-[#C5A059]/40 text-[#C5A059] bg-white/5 flex items-center justify-center rounded">
                        <IconComponent className="w-5 h-5 text-[#C5A059]" />
                      </div>
                      <span className="text-[9px] font-semibold text-[#C5A059] uppercase tracking-widest px-2.5 py-1 rounded bg-white/5 border border-[#C5A059]/20">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-serif italic text-white group-hover:text-[#C5A059] transition-colors">
                      {feat.title}
                    </h3>

                    <p className="text-xs text-white/60 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center gap-2 text-[10px] text-white/40 font-semibold uppercase tracking-widest">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Verified Estate Standard</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* ELECTRONIC ACCESS CONCEPT FLOW */}
      <Section background="subtle">
        <Container size="lg">
          <SectionHeader
            eyebrow="Keycard Lifecycle"
            title="ELECTRONIC ACCESS CONCEPT"
            description="How encrypted RFID access cards manage suite permissions throughout a guest's stay."
          />

          {/* Visual Step-by-Step Flow */}
          <div className="relative space-y-4 max-w-2xl mx-auto">
            {conceptSteps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <React.Fragment key={step.number}>
                  <div className="p-6 rounded-2xl bg-[#111111] border border-white/10 flex items-start gap-5 shadow-xl relative overflow-hidden group hover:border-[#C5A059]/50 transition-all">
                    <div className="flex flex-col items-center justify-center shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-[#C5A059]/40 text-[#C5A059] flex items-center justify-center font-bold text-base">
                        <StepIcon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-serif italic text-[#C5A059] mt-1 font-bold">
                        Step {step.number}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-serif italic text-white group-hover:text-[#C5A059] transition-colors">
                        {step.title}
                      </h4>
                      <p className="text-xs text-white/60 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {idx < conceptSteps.length - 1 && (
                    <div className="flex justify-center my-1">
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-[#C5A059]/30 text-[#C5A059] flex items-center justify-center">
                        <ArrowDown className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Explicit Hardware Integration Disclaimer */}
          <div className="mt-12 p-6 rounded-2xl bg-black/60 border border-[#C5A059]/30 flex items-start gap-4">
            <div className="p-2.5 rounded bg-white/5 border border-[#C5A059]/40 text-[#C5A059] shrink-0 mt-0.5">
              <Info className="w-5 h-5 text-[#C5A059]" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-[#C5A059] uppercase tracking-widest">
                Technical Disclaimer Notice
              </h4>
              <p className="text-xs text-white/70 leading-relaxed">
                Please note: The website digital platform simulates and manages card issuance workflows and data specifications. The website is not currently connected directly to physical gate or door lock hardware, and no physical hardware API integration is operational on this website.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* TYPESCRIPT DATA STRUCTURE SHOWCASE */}
      <Section background="default">
        <Container size="lg">
          <SectionHeader
            eyebrow="System Architecture"
            title="ACCESS CARD DATA STRUCTURE"
            description="TypeScript interface specification for AccessCard management."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Card Object Viewer */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-serif italic text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#C5A059]" /> Select Access Card Instance:
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {sampleCards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setActiveTabCard(card)}
                    className={`px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all shrink-0 ${
                      activeTabCard.id === card.id
                        ? 'bg-[#C5A059] text-black font-bold'
                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                    }`}
                  >
                    {card.cardIdentifier} ({card.status})
                  </button>
                ))}
              </div>

              {/* JSON Visualizer */}
              <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/10 font-mono text-xs text-emerald-400 space-y-2 overflow-x-auto shadow-2xl">
                <div className="text-white/40 text-[10px] uppercase tracking-widest font-sans mb-2 flex items-center justify-between border-b border-white/10 pb-2">
                  <span>AccessCard JSON Payload</span>
                  <span className="text-[#C5A059] font-bold">Status: {activeTabCard.status}</span>
                </div>
                <pre className="text-white/80 leading-relaxed">
{JSON.stringify(activeTabCard, null, 2)}
                </pre>
              </div>
            </div>

            {/* Simulated Digital Keycard Visual */}
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-serif italic text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C5A059]" /> Simulated Guest RFID Keycard:
              </span>

              <div className="p-8 rounded-3xl bg-gradient-to-br from-[#1A1A1A] via-[#111111] to-black border border-[#C5A059]/40 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#C5A059] block">
                      KILIFA SUITES • ACCESS CARD
                    </span>
                    <h3 className="text-xl font-serif italic text-white mt-1">
                      {activeTabCard.suiteName}
                    </h3>
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-[#C5A059]/30 text-[#C5A059]">
                    <Lock className="w-5 h-5" />
                  </div>
                </div>

                <div className="py-4 border-y border-white/10 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest block">Card ID</span>
                    <span className="font-mono text-[#C5A059] font-bold">{activeTabCard.cardIdentifier}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest block">Booking ID</span>
                    <span className="font-mono text-white/80">{activeTabCard.bookingId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest block">Activated</span>
                    <span className="text-white/70">{new Date(activeTabCard.activatedAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest block">Expires</span>
                    <span className="text-white/70">{new Date(activeTabCard.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">
                    Status: <strong className="text-[#C5A059] uppercase">{activeTabCard.status}</strong>
                  </span>
                  <span className="text-[10px] text-white/30 italic">
                    RFID Encrypted Security
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#111111] border border-white/10 text-xs text-white/60">
                <p>
                  <strong>Security Note:</strong> RFID keycards are encoded specifically for registered guests during check-in. Keycards cannot be duplicated or reused after the stay authorization expires.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button to="/booking" variant="primary" size="lg" leftIcon={<Calendar className="w-4 h-4" />}>
              Book Your Secure Stay at Kilifa Suites
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
};
