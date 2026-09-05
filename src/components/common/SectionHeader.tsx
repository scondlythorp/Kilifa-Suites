import React from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center' | 'right';
  theme?: 'light' | 'dark';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  description,
  align = 'center',
  theme = 'light',
  className = '',
}) => {
  const alignClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center mx-auto',
    right: 'text-right items-end ml-auto',
  };

  return (
    <div className={`flex flex-col max-w-3xl mb-12 sm:mb-16 ${alignClasses[align]} ${className}`}>
      {eyebrow && (
        <div className="flex items-center gap-3 mb-3">
          <span className="h-px w-8 bg-[#C5A059]"></span>
          <span className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#C5A059]">
            {eyebrow}
          </span>
          <span className="h-px w-8 bg-[#C5A059]"></span>
        </div>
      )}
      <h2 className="text-style-h2 mb-4 text-white font-serif italic">
        {title}
      </h2>
      {description && (
        <p className="text-style-body text-base sm:text-lg text-white/60">
          {description}
        </p>
      )}
    </div>
  );
};
