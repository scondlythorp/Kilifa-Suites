import React from 'react';
import { Container } from './Container';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  bgTag?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  bgTag = 'Kilifa Suites Hospitality',
}) => {
  return (
    <div className="relative bg-[#0A0A0A] text-white pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden border-b border-white/10">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      
      {/* Subtle Ambient Overlay */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />

      <Container className="relative z-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/50 mb-6">
          <Link to="/" className="hover:text-[#C5A059] transition-colors">
            Home
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-white/30" />
              {crumb.href ? (
                <Link to={crumb.href} className="hover:text-[#C5A059] transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-white font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Tagline Badge */}
        {bgTag && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/5 border border-[#C5A059]/30 text-[#C5A059] text-[10px] font-semibold uppercase tracking-[0.3em] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
            {bgTag}
          </div>
        )}

        {/* Main Title & Subtitle */}
        <h1 className="text-style-h1 text-white max-w-4xl tracking-tight mb-4 font-serif italic">
          {title}
        </h1>
        {subtitle && (
          <p className="text-style-body text-white/60 max-w-2xl text-base sm:text-lg">
            {subtitle}
          </p>
        )}
      </Container>
    </div>
  );
};
