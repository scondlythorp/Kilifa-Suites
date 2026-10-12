export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogType: string;
  canonicalPath: string;
}

export const SEO_CONFIG: Record<string, SEOMetadata> = {
  home: {
    title: 'Kilifa Suites | Luxury Guest House in Soma, Lower River Region, The Gambia',
    description: 'Experience refined luxury, uncompromised security, and authentic Gambian warmth at Kilifa Suites in Tabokoto, Soma. Featuring 12 executive suites across 2 private houses.',
    keywords: 'Kilifa Suites, Soma guest house, Lower River Region Gambia, luxury accommodation Soma, Alhaji Kilifa hotel, Tabokoto guest house, Gambia hotels, secure suites Soma',
    ogTitle: 'Kilifa Suites - Luxury Guest House in Soma, The Gambia',
    ogDescription: '12 Executive Suites across 2 private houses in Tabokoto, Soma. Solar power, high-grade security, and quiet comfort.',
    ogType: 'website',
    canonicalPath: '/',
  },
  suites: {
    title: 'Suites & Accommodations | Kilifa Suites, Soma',
    description: 'Explore our 12 executive private suites in House 1 and House 2 at Kilifa Suites, Tabokoto, Soma. Designed for privacy, climate comfort, and quiet luxury.',
    keywords: 'Kilifa Suites accommodation, House 1 suites, House 2 suites, Soma hotel rooms, private suites Gambia',
    ogTitle: 'Suites & Accommodations - Kilifa Suites',
    ogDescription: '12 private executive suites in House 1 and House 2 with 24/7 solar power, climate control, and en-suite luxury.',
    ogType: 'website',
    canonicalPath: '/suites',
  },
  about: {
    title: 'About Us & Founder Alhaji Kilifa | Kilifa Suites',
    description: 'Learn about Kilifa Suites in Tabokoto, Soma, founded under the vision of Alhaji Kilifa. Discover our commitment to luxury serviced suites, guest security, and Lower River Region community heritage.',
    keywords: 'Alhaji Kilifa, Kilifa Suites, Soma guest house history, Tabokoto hospitality, Lower River Region owner',
    ogTitle: 'About Kilifa Suites & Founder Alhaji Kilifa',
    ogDescription: 'Crafted with passion for authentic Gambian hospitality, safety, and modern comfort in Soma.',
    ogType: 'website',
    canonicalPath: '/about',
  },
  amenities: {
    title: 'Amenities & Guest Services | Kilifa Suites',
    description: 'Discover the premium amenities at Kilifa Suites: 24/7 solar power backup, high-speed Wi-Fi, gated security, climate control, rainfall showers, and complimentary breakfast.',
    keywords: 'Kilifa Suites amenities, solar power Soma, high speed wifi Soma, gated security guest house Gambia',
    ogTitle: 'Amenities & Facilities - Kilifa Suites',
    ogDescription: 'Comprehensive luxury amenities ensuring zero power interruptions, maximum privacy, and peaceful relaxation.',
    ogType: 'website',
    canonicalPath: '/amenities',
  },
  guestExperience: {
    title: 'Guest Experience & Privacy Protocols | Kilifa Suites',
    description: 'Experience tailored hospitality, discreet security, personalized concierge services, and local cultural warmth at Kilifa Suites in Soma.',
    keywords: 'guest experience Soma, private stay Gambia, hospitality concierge Soma, Kilifa privacy',
    ogTitle: 'Guest Experience - Kilifa Suites',
    ogDescription: 'Dedicated to guest privacy, climate comfort, and effortless Gambian hospitality.',
    ogType: 'website',
    canonicalPath: '/guest-experience',
  },
  gallery: {
    title: 'Photo & Video Gallery | Kilifa Suites',
    description: 'Browse architectural views, suite layouts, estate grounds, and walkthrough videos of Kilifa Suites in Tabokoto, Soma.',
    keywords: 'Kilifa Suites photo gallery, Soma hotel pictures, video tour guest house Gambia',
    ogTitle: 'Photo & Video Gallery - Kilifa Suites',
    ogDescription: 'Visual foundation and video walkthroughs showcasing House 1 and House 2.',
    ogType: 'website',
    canonicalPath: '/gallery',
  },
  workshops: {
    title: 'Workshops & Business Gatherings | Kilifa Suites',
    description: 'Host executive workshops, retreats, and business meetings at Kilifa Suites in Soma, Lower River Region. Equipped with power backup and fiber Wi-Fi.',
    keywords: 'workshops Soma Gambia, business retreats Lower River Region, meeting space Soma',
    ogTitle: 'Workshops & Retreats - Kilifa Suites',
    ogDescription: 'Serene, well-equipped venue for small group workshops and executive retreats in Soma.',
    ogType: 'website',
    canonicalPath: '/workshops',
  },
  location: {
    title: 'Location & Travel Guide | Tabokoto, Soma, Lower River Region',
    description: 'Find Kilifa Suites in Tabokoto, Soma, Lower River Region, The Gambia. Directions, local landmarks, transit distances, and map information.',
    keywords: 'Kilifa Suites location, Tabokoto Soma map, Lower River Region hotel address, travel to Soma Gambia',
    ogTitle: 'Location & Directions - Kilifa Suites',
    ogDescription: 'Conveniently situated in Tabokoto, Soma, linking major transit routes across Lower River Region.',
    ogType: 'website',
    canonicalPath: '/location',
  },
  contact: {
    title: 'Contact Us & Direct Inquiries | Kilifa Suites',
    description: 'Get in touch with Kilifa Suites in Soma. Phone: +220 700 1234, WhatsApp, Email: info@kilifasuites.com. Direct support for reservations.',
    keywords: 'contact Kilifa Suites, Soma guest house phone, WhatsApp Kilifa Suites, Alhaji Kilifa contact',
    ogTitle: 'Contact Kilifa Suites',
    ogDescription: 'Direct inquiries, phone, WhatsApp, and reservation assistance for Kilifa Suites.',
    ogType: 'website',
    canonicalPath: '/contact',
  },
  booking: {
    title: 'Reservation Inquiry | Kilifa Suites',
    description: 'Inquire about availability for DAR, SAMA, LAAWOL, EJAM, YERMANDE, BAJAM, SUUDU, WURO, YIDI, KENE, SAGO, NDIYA at Kilifa Suites in Soma, The Gambia.',
    keywords: 'book Kilifa Suites, reserve suite Soma, guest house booking Gambia',
    ogTitle: 'Reservation Inquiry - Kilifa Suites',
    ogDescription: 'Reserve your stay at Kilifa Suites. Select dates, suite preferences, and guest requirements.',
    ogType: 'website',
    canonicalPath: '/booking',
  },
  security: {
    title: 'Security & Electronic Guest Access | Kilifa Suites, Soma',
    description: 'Learn about 24-hour CCTV monitoring, electrical fencing, alarm systems, reception presence, and electronic guest access cards at Kilifa Suites.',
    keywords: 'Kilifa Suites security, electronic guest access, CCTV monitoring Soma, gated compound Gambia, access card system',
    ogTitle: 'Security & Electronic Access - Kilifa Suites',
    ogDescription: '24-hour perimeter security, electrical fencing, CCTV surveillance, and electronic RFID guest keycard access.',
    ogType: 'website',
    canonicalPath: '/security',
  },
};

