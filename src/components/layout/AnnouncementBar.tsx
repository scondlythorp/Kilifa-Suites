import React from 'react';
import { Link } from 'react-router-dom';

export const ANNOUNCEMENT_MESSAGES = [
  {
    text: '✨ Welcome to Kilifa Suites — Your Comfort, Our Priority ✨',
    highlight: true,
    separator: '◆',
  },
  {
    text: 'Experience Exceptional Comfort and Relaxation',
    link: '/amenities',
    separator: '✦',
  },
  {
    text: 'Discover Your Perfect Stay with Kilifa Suites',
    link: '/suites',
    separator: '◆',
  },
  {
    text: 'Contact Us Today to Plan Your Stay',
    link: '/contact',
    separator: '✦',
  },
];

export const AnnouncementBar: React.FC = () => {
  // Render two identical message sequences for seamless 50% translation infinite loop
  const renderMessageSequence = (keyPrefix: string) => (
    <div key={keyPrefix} className="flex items-center shrink-0">
      {ANNOUNCEMENT_MESSAGES.map((msg, idx) => (
        <React.Fragment key={`${keyPrefix}-${idx}`}>
          <span className="inline-flex items-center px-3 sm:px-6 whitespace-nowrap text-[11px] sm:text-xs font-medium sm:font-semibold tracking-wider text-[#171717]">
            {msg.link ? (
              <Link
                to={msg.link}
                className="hover:underline hover:opacity-85 transition-opacity inline-flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-[#171717] rounded"
              >
                <span>{msg.text}</span>
              </Link>
            ) : (
              <span>{msg.text}</span>
            )}
          </span>
          <span
            className="text-[#171717]/60 select-none text-[9px] sm:text-[10px] px-1"
            aria-hidden="true"
          >
            {msg.separator}
          </span>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <aside
      aria-label="Kilifa Suites Announcements"
      className="relative w-full bg-[#C9A44C] text-[#171717] border-b border-[#B8933D] overflow-hidden z-50 select-none h-8 sm:h-9 flex items-center shadow-sm"
    >
      {/* Subtle edge gradient masks for gentle entrance and exit */}
      <div className="absolute left-0 top-0 bottom-0 w-6 sm:w-16 bg-gradient-to-r from-[#C9A44C] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-6 sm:w-16 bg-gradient-to-l from-[#C9A44C] to-transparent z-10 pointer-events-none" />

      {/* Marquee Scrolling Viewport */}
      <div className="marquee-container flex-1 overflow-hidden relative flex items-center h-full">
        <div className="animate-marquee-infinite flex items-center cursor-default">
          {renderMessageSequence('seq-1')}
          {renderMessageSequence('seq-2')}
        </div>
      </div>
    </aside>
  );
};
