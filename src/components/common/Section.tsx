import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  background?: 'default' | 'surface' | 'subtle' | 'primary' | 'dark';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Section: React.FC<SectionProps> = ({
  children,
  id,
  className = '',
  background = 'default',
  padding = 'lg',
}) => {
  const bgClasses = {
    default: 'bg-[#0A0A0A] text-white',
    surface: 'bg-[#111111] text-white',
    subtle: 'bg-[#161616] text-white',
    primary: 'bg-[#1A1A1A] text-white border-y border-white/10',
    dark: 'bg-[#080808] text-white',
  };

  const paddingClasses = {
    none: 'py-0',
    sm: 'py-8 sm:py-12',
    md: 'py-12 sm:py-16',
    lg: 'py-16 sm:py-24',
    xl: 'py-20 sm:py-32',
  };

  return (
    <section id={id} className={`w-full relative ${bgClasses[background]} ${paddingClasses[padding]} ${className}`}>
      {children}
    </section>
  );
};
