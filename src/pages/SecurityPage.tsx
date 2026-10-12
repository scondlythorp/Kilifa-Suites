import React from 'react';
import { SEOHead } from '../components/seo/SEOHead';
import { PageHeader } from '../components/common/PageHeader';
import { Container } from '../components/common/Container';
import { Section } from '../components/common/Section';
import { SectionHeader } from '../components/common/SectionHeader';
import { Button } from '../components/common/Button';
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
  Sparkles,
  Server,
  Building2,
  ShieldAlert,
} from 'lucide-react';

export const SecurityPage: React.FC = () => {
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

          {/* Featured Security Personnel Card */}
          <div className="mb-10 p-6 sm:p-8 rounded-3xl bg-[#111111] border border-white/10 shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5">
              <div className="p-2 rounded-2xl bg-[#161616] border border-white/10 overflow-hidden group">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black">
                  <img
                    src="/media/images/kilifa-security-officer-01.jpeg"
                    alt="24/7 Dedicated Uniformed Security Personnel at Kilifa Suites"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-xs text-white">
                    <span className="font-serif italic text-sm text-[#C5A059] block">24/7 Security Presence</span>
                    <span className="text-[10px] text-white/70">Manned Compound Gates & Patrols</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-[#C5A059]/40 text-[#C5A059] text-[10px] font-semibold uppercase tracking-[0.25em]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>On-Site Guard Detail</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif italic text-white">
                Dedicated 24-Hour Uniformed Personnel
              </h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-light">
                At Kilifa Suites, guest safety and uninterrupted peace of mind are paramount. Our property features continuously stationed, uniformed security officers safeguarding compound entry points, verifying incoming guests, and maintaining perimeter safety around the clock in Tabokoto, Soma.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
                  <span>Continuous Gate Surveillance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
                  <span>Visitor Verification Protocols</span>
                </div>
              </div>
            </div>
          </div>

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

          {/* Estate Privacy & Access Protection */}
          <div className="mt-12 p-8 rounded-3xl bg-[#111111] border border-white/10 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-[#C5A059]/40 text-[#C5A059] text-[10px] font-semibold uppercase tracking-[0.25em]">
                <Lock className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Guest Privacy Protection</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif italic text-white">
                Personalized RFID Keycard Technology
              </h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-light">
                Every visiting guest is issued an encrypted RFID keycard upon arrival at Kilifa Suites reception. Each card is programmed strictly for your designated suite and compound access gates during the duration of your stay. When you check out, credentials expire automatically to guarantee complete privacy and security for future guests.
              </p>
              <ul className="space-y-2 text-xs text-white/60">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>Contactless, secure RFID smart chip technology</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>Individual private suite authorization</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>Automatic de-activation upon checkout</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#161616] via-[#111111] to-black border border-[#C5A059]/30 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-white/5 border border-[#C5A059] flex items-center justify-center text-[#C5A059]">
                <ShieldCheck className="w-8 h-8 text-[#C5A059]" />
              </div>
              <h4 className="text-lg font-serif italic text-white">
                Rest with Complete Confidence
              </h4>
              <p className="text-xs text-white/60 leading-relaxed max-w-sm mx-auto">
                Whether traveling for international business, family holidays, or countryside excursions in Soma, your security is actively protected 24 hours a day.
              </p>
              <div className="pt-2">
                <Button to="/booking" variant="secondary" size="md" leftIcon={<Calendar className="w-4 h-4" />}>
                  Reserve Your Suite
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
};
