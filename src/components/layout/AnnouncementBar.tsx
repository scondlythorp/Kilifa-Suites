import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Calendar, Sparkles } from 'lucide-react';

interface AnnouncementBarProps {
  onDismiss?: () => void;
  isDismissed?: boolean;
}

export const ANNOUNCEMENT_MESSAGES = [
  {
    text: '✨ Welcome to Kilifa Suites — Your Comfort, Our Priority ✨',
    highlight: true,
  },
  {
    text: 'Experience Exceptional Comfort and Relaxation',
    link: '/amenities',
  },
  {
    text: 'Discover Your Perfect Stay with Kilifa Suites',
    link: '/suites',
  },
  {
    text: 'Contact Us Today to Plan Your Stay',
    link: '/contact',
  },
];

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  onDismiss,
  isDismissed: controlledDismissed,
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof controlledDismissed === 'boolean') {
      return controlledDismissed;
    }
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('kilifa_announcement_bar_dismissed') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (typeof controlledDismissed === 'boolean') {
      setIsDismissed(controlledDismissed);
    }
  }, [controlledDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('kilifa_announcement_bar_dismissed', 'true');
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  if (isDismissed) {
    return null;
  }

  // Render two identical message series for seamless 50% translation infinite loop
  const renderMessageSequence = (keyPrefix: string) => (
    <div key={keyPrefix} className="flex items-center shrink-0">
      {ANNOUNCEMENT_MESSAGES.map((msg, idx) => (
        <React.Fragment key={`${keyPrefix}-${idx}`}>
          <span className="inline-flex items-center px-4 sm:px-6 whitespace-nowrap text-[11px] sm:text-xs font-semibold tracking-wider text-[#171717]">
            {msg.link ? (
              <Link
                to={msg.link}
                className="hover:underline hover:opacity-80 transition-opacity inline-flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-[#171717] rounded"
              >
                <span>{msg.text}</span>
              </Link>
            ) : (
              <span>{msg.text}</span>
            )}
          </span>
          <span
            className="text-[#171717]/50 select-none text-[9px] sm:text-[10px]"
            aria-hidden="true"
          >
            ✦
          </span>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <aside
      aria-label="Kilifa Suites Announcements"
      className="relative w-full bg-[#C9A44C] text-[#171717] border-b border-[#B8933D] overflow-hidden z-50 select-none transition-all duration-300 h-8 sm:h-9 flex items-center shadow-sm"
    >
      {/* Subtle edge gradient masks for gentle entrance and exit */}
      <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#C9A44C] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-16 sm:right-28 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#C9A44C] to-transparent z-10 pointer-events-none" />

      {/* Marquee Scrolling Viewport */}
      <div className="marquee-container flex-1 overflow-hidden relative flex items-center h-full">
        <div className="animate-marquee-infinite flex items-center cursor-default">
          {renderMessageSequence('seq-1')}
          {renderMessageSequence('seq-2')}
        </div>
      </div>

      {/* Quick Call to Action & Close Action on the Right */}
      <div className="relative z-20 shrink-0 flex items-center gap-1.5 sm:gap-2 pr-2.5 sm:pr-4 pl-2 bg-[#C9A44C]">
        <Link
          to="/booking"
          className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#171717] text-[#C9A44C] text-[10px] font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-all shadow-sm focus:outline-none focus:ring-1 focus:ring-[#171717]"
        >
          <Calendar className="w-2.5 h-2.5" />
          <span>Book Stay</span>
        </Link>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 rounded-full text-[#171717]/80 hover:text-[#171717] hover:bg-black/10 transition-colors focus:outline-none focus:ring-1 focus:ring-[#171717]"
          aria-label="Dismiss announcement bar"
          title="Dismiss announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
