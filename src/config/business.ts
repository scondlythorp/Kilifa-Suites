import { BusinessConfig, Suite, Amenity, Media, Staff } from '../types';

export const BUSINESS_CONFIG: BusinessConfig = {
  name: 'Kilifa Suites',
  tagline: 'Refined Luxury, Uncompromised Privacy & Gambian Warmth in Soma',
  category: 'Guest House / Hotel',
  owner: 'Kilifa Suites Management',
  location: {
    street: 'Main Highway Link, Tabokoto Area',
    neighborhood: 'Tabokoto',
    city: 'Soma',
    region: 'Lower River Region',
    country: 'The Gambia',
    fullAddress: 'Tabokoto, Soma, Lower River Region, The Gambia',
    googleMapsUrl: 'https://maps.google.com/?q=Soma+Lower+River+Region+The+Gambia',
    coordinates: {
      lat: 13.4333,
      lng: -15.5333,
    },
  },
  contact: {
    phone: '+220 700 1234',
    phoneFormatted: '+220 (700) 1234',
    whatsapp: '+2207001234',
    whatsappUrl: 'https://wa.me/2207001234?text=Hello%20Kilifa%20Suites%2C%20I%20would%20like%20to%20inquire%20about%20a%20suite%20reservation.',
    email: 'modoulaminthorp4@gmail.com',
  },
  socials: {
    instagram: 'https://instagram.com/kilifasuites',
    facebook: 'https://facebook.com/kilifasuites',
    tiktok: 'https://tiktok.com/@kilifasuites',
  },
  logo: {
    svgPlaceholder: '/media/images/kilifa-logo.jpeg',
    textMark: 'KILIFA SUITES',
  },
  history: {
    establishmentYear: '2024',
    inaugurationYear: '2025',
  },
  jufre: {
    brandName: 'Jufure',
    description: "Premium Gambian fashion and lifestyle brand associated with Kilifa hospitality.",
    link: 'https://kilifasuites.com',
  },
  property: {
    totalHouses: 2,
    suitesPerHouse: 6,
    totalSuites: 12,
  },
};

/**
 * Hospitality Rating Display Configuration
 *
 * NOTE ON RATING INTEGRITY:
 * The 9.7/10 rating is a requested presentation value representing the property's
 * target hospitality standard for guest satisfaction and comfort in Soma.
 * It is NOT backed by verified historical third-party review platforms or guest survey audits.
 *
 * Configurable properties:
 * - score: Display score (9.7)
 * - scale: Display scale (10)
 * - label: Category label
 * - sublabel: Category subtitle
 * - verified: Boolean flag indicating whether customer audit confirmation is complete
 * - auditNote: Internal note for management review prior to public release
 */
export const HOSPITALITY_RATING_CONFIG = {
  score: 9.7,
  scale: 10,
  label: 'Hospitality Rating',
  sublabel: 'Guest Comfort Benchmark',
  verified: false, // Flagged: Requires formal guest audit confirmation before public commercial release
  auditNote: 'Requested presentation score (9.7/10). Awaiting verified guest feedback audit.',
};

export const HOUSES_DATA = [
  {
    houseNumber: 1,
    title: 'House 1 — Courtyard & Garden Residence',
    description: 'House 1 features 6 private suites (Suites 01 to 06) arranged around the central garden courtyard with ground and upper level access.',
    totalSuites: 6,
  },
  {
    houseNumber: 2,
    title: 'House 2 — Private Terrace & Estate Residence',
    description: 'House 2 features 6 private suites (Suites 07 to 12) featuring elevated estate views, secluded privacy, and dedicated solar battery bank access.',
    totalSuites: 6,
  },
];

const suiteFeaturedImages = [
  '/media/images/kilifa-parlor-01.jpeg',
  '/media/images/kilifa-parlor-02.jpeg',
  '/media/images/kilifa-parlor-03.jpeg',
  '/media/images/kilifa-suite-living-room-02.jpeg',
  '/media/images/kilifa-suite-living-room-03.jpeg',
  '/media/images/kilifa-suite-bedroom-01.jpeg',
  '/media/images/kilifa-suite-bedroom-02.jpeg',
  '/media/images/kilifa-suite-room-02.jpeg',
  '/media/images/kilifa-parlor-01.jpeg',
  '/media/images/kilifa-parlor-02.jpeg',
  '/media/images/kilifa-suite-living-room-03.jpeg',
  '/media/images/kilifa-suite-bedroom-01.jpeg',
];

const suiteGalleries = [
  [
    '/media/images/kilifa-parlor-01.jpeg',
    '/media/images/kilifa-suite-bedroom-01.jpeg',
    '/media/images/kilifa-suite-tv-desk-01.jpeg',
    '/media/images/kilifa-veranda-interior-01.jpeg',
  ],
  [
    '/media/images/kilifa-parlor-02.jpeg',
    '/media/images/kilifa-suite-bedroom-02.jpeg',
    '/media/images/kilifa-suite-tv-desk-02.jpeg',
    '/media/images/kilifa-veranda-interior-02.jpeg',
  ],
  [
    '/media/images/kilifa-parlor-03.jpeg',
    '/media/images/kilifa-suite-bedroom-01.jpeg',
    '/media/images/kilifa-suite-tv-desk-03.jpeg',
    '/media/images/kilifa-veranda-interior-03.jpeg',
  ],
  [
    '/media/images/kilifa-suite-living-room-02.jpeg',
    '/media/images/kilifa-suite-bedroom-02.jpeg',
    '/media/images/kilifa-suite-tv-desk-04.jpeg',
    '/media/images/kilifa-seating-area-01.jpeg',
  ],
  [
    '/media/images/kilifa-suite-living-room-03.jpeg',
    '/media/images/kilifa-suite-bedroom-01.jpeg',
    '/media/images/kilifa-suite-tv-desk-01.jpeg',
    '/media/images/kilifa-decoration-01.jpeg',
  ],
  [
    '/media/images/kilifa-suite-room-02.jpeg',
    '/media/images/kilifa-suite-bedroom-02.jpeg',
    '/media/images/kilifa-suite-tv-desk-02.jpeg',
    '/media/images/kilifa-decoration-02.jpeg',
  ],
  [
    '/media/images/kilifa-parlor-01.jpeg',
    '/media/images/kilifa-suite-bedroom-01.jpeg',
    '/media/images/kilifa-suite-tv-desk-03.jpeg',
    '/media/images/kilifa-veranda-overview-01.jpeg',
  ],
  [
    '/media/images/kilifa-parlor-02.jpeg',
    '/media/images/kilifa-suite-bedroom-02.jpeg',
    '/media/images/kilifa-suite-tv-desk-04.jpeg',
    '/media/images/kilifa-veranda-overview-02.jpeg',
  ],
  [
    '/media/images/kilifa-parlor-03.jpeg',
    '/media/images/kilifa-suite-bedroom-01.jpeg',
    '/media/images/kilifa-suite-tv-desk-01.jpeg',
    '/media/images/kilifa-veranda-interior-01.jpeg',
  ],
  [
    '/media/images/kilifa-suite-living-room-02.jpeg',
    '/media/images/kilifa-suite-bedroom-02.jpeg',
    '/media/images/kilifa-suite-tv-desk-02.jpeg',
    '/media/images/kilifa-seating-area-01.jpeg',
  ],
  [
    '/media/images/kilifa-suite-living-room-03.jpeg',
    '/media/images/kilifa-suite-bedroom-01.jpeg',
    '/media/images/kilifa-suite-tv-desk-03.jpeg',
    '/media/images/kilifa-decoration-01.jpeg',
  ],
  [
    '/media/images/kilifa-suite-room-02.jpeg',
    '/media/images/kilifa-suite-bedroom-02.jpeg',
    '/media/images/kilifa-suite-tv-desk-04.jpeg',
    '/media/images/kilifa-veranda-interior-02.jpeg',
  ],
];

export const OFFICIAL_SUITE_NAMES = [
  'DAR',
  'SAMA',
  'LAAWOL',
  'EJAM',
  'YERMANDE',
  'BAJAM',
  'SUUDU',
  'WURO',
  'YIDI',
  'KENE',
  'SAGO',
  'NDIYA',
];

// Official 12 Suites: DAR, SAMA, LAAWOL, EJAM, YERMANDE, BAJAM, SUUDU, WURO, YIDI, KENE, SAGO, NDIYA
export const SUITES_DATA: Suite[] = Array.from({ length: 12 }, (_, index) => {
  const num = index + 1;
  const numFormatted = num < 10 ? `0${num}` : `${num}`;
  const houseNumber: 1 | 2 = num <= 6 ? 1 : 2;
  const suiteInHouse = num <= 6 ? num : num - 6;
  const suiteName = OFFICIAL_SUITE_NAMES[index] || `Suite ${numFormatted}`;

  return {
    id: `suite-${numFormatted}`,
    slug: `suite-${numFormatted}`,
    name: suiteName,
    houseNumber,
    suiteNumber: suiteInHouse,
    description: `${suiteName} is an elegantly proportioned, private executive suite situated in House ${houseNumber} at Kilifa Suites. Designed for maximum tranquility, privacy, and climate comfort in Soma, Lower River Region.`,
    shortDescription: `${suiteName} - Executive private suite in House ${houseNumber} featuring premium climate control, private bath, and 24/7 solar backup power.`,
    masterBedroomDescription: `Features a plush ${num % 2 === 0 ? 'King Executive Bed' : 'Queen Bed'} dressed in high-thread-count cotton linens, individual split-system silent air conditioning, blackout drapery, and custom bedside lighting.`,
    parlorDescription: `A spacious private sitting parlor equipped with upholstered lounge furniture, a dedicated workstation desk, high-speed fiber Wi-Fi, and a Smart HDTV with satellite and streaming support.`,
    bathroomDescription: `Private en-suite bathroom fitted with a rainfall pressure shower, solar-heated continuous hot water, vanity counter, plush bath towels, and luxury toiletries.`,
    maxOccupancy: num % 3 === 0 ? 4 : 2,
    sizeSqM: 42 + (num % 4) * 6,
    bedrooms: num % 4 === 0 ? 2 : 1,
    bathrooms: 1,
    bedType: num % 2 === 0 ? 'King Executive Bed' : 'Queen Plush Bed',
    pricePerNight: 2500,
    currency: 'GMD',
    baseAmenities: [
      '24/7 Solar Power Backup',
      'High-Capacity Air Conditioning',
      'En-suite Luxury Bathroom',
      'High-Speed Wi-Fi',
      'Smart HDTV with Streaming',
      'Private Keycard Access',
      'In-Room Safe',
      'Tea & Coffee Service',
    ],
    featuredImage: suiteFeaturedImages[index],
    galleryImages: suiteGalleries[index],
    videos: [
      {
        id: `vid-suite-${numFormatted}-1`,
        type: 'video',
        url: '/media/videos/kilifa-interior-tour-01.mp4',
        thumbnail: suiteFeaturedImages[index],
        posterImage: suiteFeaturedImages[index],
        caption: `Executive Suite Interior Walkthrough`,
        alt: `Interior video tour of suite at Kilifa Suites`,
        category: 'suites',
        duration: '01:45',
      },
      {
        id: `vid-suite-${numFormatted}-2`,
        type: 'video',
        url: '/media/videos/kilifa-property-exterior-tour-01.mp4',
        thumbnail: '/media/images/kilifa-property-exterior-01.jpeg',
        posterImage: '/media/images/kilifa-property-exterior-01.jpeg',
        caption: `Kilifa Suites Property & Compound Grounds`,
        alt: `Property exterior tour of Kilifa Suites`,
        category: 'exterior',
        duration: '01:10',
      },
    ],
    status: 'available',
    floor: suiteInHouse <= 3 ? 'Ground Floor' : 'First Floor',
    view: houseNumber === 1 ? 'Garden & Inner Courtyard View' : 'Private Estate Terrace View',
  };
});

export const AMENITIES_DATA: Amenity[] = [
  {
    id: 'ac-1',
    name: 'Air Conditioning',
    category: 'Climate & Comfort',
    icon: 'Wind',
    description: 'Individual inverter split-system silent air conditioning in every suite, providing instant cooling in Soma.',
    isFeatured: true,
  },
  {
    id: 'tv-1',
    name: 'Smart HDTVs',
    category: 'Entertainment',
    icon: 'Tv',
    description: 'High-definition televisions in private parlors equipped with satellite channels and digital streaming support.',
    isFeatured: true,
  },
  {
    id: 'cch-1',
    name: 'Upholstered Couches & Loungers',
    category: 'Suite Luxuries',
    icon: 'Sofa',
    description: 'Plush, comfortable parlor couches and seating designed for relaxation, meetings, or reading.',
    isFeatured: true,
  },
  {
    id: 'crp-1',
    name: 'Carpeted Floors & Area Rugs',
    category: 'Interior Finishes',
    icon: 'Layers',
    description: 'Soft, clean carpeted floor accents in living quarters offering warmth, sound insulation, and luxury foot comfort.',
    isFeatured: false,
  },
  {
    id: 'dec-1',
    name: 'Modern Interior Decoration',
    category: 'Interior Finishes',
    icon: 'Palette',
    description: 'Refined contemporary aesthetic featuring custom wooden cabinetry, ambient lighting, and artful decor.',
    isFeatured: true,
  },
  {
    id: 'wtr-1',
    name: 'Reliable Water Supply',
    category: 'Estate Infrastructure',
    icon: 'Droplets',
    description: 'Continuous filtered water connection backed by on-site reserve tanks and continuous pressure pumps.',
    isFeatured: true,
  },
  {
    id: 'hwtr-1',
    name: 'Hot & Cold Water Systems',
    category: 'Estate Infrastructure',
    icon: 'Flame',
    description: 'Continuous solar-heated and pressure-regulated hot and cold water supply across all suite shower units.',
    isFeatured: true,
  },
  {
    id: 'sol-1',
    name: 'Solar System',
    category: 'Power Reliability',
    icon: 'Sun',
    description: 'High-capacity, eco-friendly rooftop solar energy system delivering continuous clean power to the estate.',
    isFeatured: true,
  },
  {
    id: 'pwr-1',
    name: '24-Hour Electricity Backup',
    category: 'Power Reliability',
    icon: 'Zap',
    description: 'Automatic inverter & battery storage setup ensuring round-the-clock uninterrupted power for AC, lights, and appliances.',
    isFeatured: true,
  },
  {
    id: 'rcp-1',
    name: 'Reception Desk',
    category: 'Guest Services',
    icon: 'ConciergeBell',
    description: 'Welcoming front desk assisting guests with check-in, keycard issuance, luggage handling, and inquiries.',
    isFeatured: true,
  },
  {
    id: 'prk-1',
    name: 'Secure On-Site Parking',
    category: 'Guest Services',
    icon: 'Car',
    description: 'Spacious, gated private parking inside the compound for personal cars, SUV fleets, and transit vehicles.',
    isFeatured: true,
  },
  {
    id: 'inf-1',
    name: 'Tourist Information & Concierge',
    category: 'Guest Services',
    icon: 'Compass',
    description: 'Local guidance on Lower River Region landmarks, cross-river ferry travel, market visits, and regional transit.',
    isFeatured: true,
  },
  {
    id: 'acc-1',
    name: 'Electronic Guest Access',
    category: 'Security & Control',
    icon: 'Key',
    description: 'Encoded RFID electronic keycards providing seamless and secure access to compound gates and suite doors.',
    isFeatured: true,
  },
];

import { MEDIA_CATALOG } from '../data/mediaCatalog';

export const MEDIA_GALLERY_DATA: Media[] = MEDIA_CATALOG;

export const STAFF_DATA: Staff[] = [
  {
    id: 'stf-manager',
    name: 'Fatou',
    title: 'General Estate Manager & Guest Relations',
    position: 'General Manager',
    bio: 'Oversees day-to-day estate operations, guest experiences, and suite maintenance to guarantee an exceptional stay for every guest at Kilifa Suites.',
    avatar: '/media/images/kilifa-staff-01.jpeg',
    role: 'manager',
    department: 'Estate Operations',
    order: 1,
    socialLinks: {
      email: 'manager@kilifasuites.com',
    },
  },
  {
    id: 'stf-concierge',
    name: 'Estate Reception Lead',
    title: 'Front Desk & Guest Concierge Lead',
    position: 'Concierge Lead',
    bio: 'Assists guests with rapid RFID keycard check-ins, Lower River Region transit guidance, and personalized suite services.',
    avatar: '/media/images/kilifa-staff-02.jpeg',
    role: 'concierge',
    department: 'Guest Relations',
    order: 3,
    socialLinks: {
      whatsapp: '+2207001234',
    },
  },
  {
    id: 'stf-security',
    name: 'Compound Guard Detail',
    title: 'Head of Compound Security & Access Control',
    position: 'Head of Security',
    bio: 'Manages 24/7 entrance monitoring, CCTV surveillance, perimeter electric fence security, and vehicle access control inside Tabokoto estate.',
    avatar: '/media/images/kilifa-security-officer-01.jpeg',
    role: 'security',
    department: 'Security & Facilities',
    order: 4,
  },
  {
    id: 'stf-hospitality',
    name: 'Housekeeping Operations',
    title: 'Senior Housekeeping & Suite Attendant',
    position: 'Suite Hospitality Lead',
    bio: 'Ensures flawless cleanliness, crisp cotton linens, and continuous replenishment of amenities across all 12 executive suites.',
    avatar: '/media/images/kilifa-staff-caregiver-01.jpeg',
    role: 'hospitality',
    department: 'Housekeeping',
    order: 5,
  },
];
