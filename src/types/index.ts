/**
 * Kilifa Suites - Data Types Definition
 * Phase 1 Architecture
 */

export interface Suite {
  id: string;
  slug: string;
  name: string; // DAR, SAMA, LAAWOL, EJAM, YERMANDE, BAJAM, SUUDU, WURO, YIDI, KENE, SAGO, NDIYA
  houseNumber: 1 | 2;
  suiteNumber: number; // 1 to 6 per house
  description: string;
  shortDescription: string;
  masterBedroomDescription: string;
  parlorDescription: string;
  bathroomDescription: string;
  maxOccupancy: number;
  sizeSqM: number;
  bedrooms: number;
  bathrooms: number;
  bedType: string;
  pricePerNight: number;
  currency: string;
  baseAmenities: string[];
  featuredImage: string;
  galleryImages: string[];
  images?: string[];
  videos?: any[];
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  floor: 'Ground Floor' | 'First Floor' | 'Executive Upper';
  view: string;
}

export interface Media {
  id: string;
  type: 'image' | 'video';
  url: string;
  caption: string;
  alt?: string;
  category: 'photos' | 'videos' | 'exterior' | 'interior' | 'suites' | 'bedrooms' | 'parlors' | 'bathrooms' | 'amenities' | 'staff' | 'security' | 'compound' | 'grounds' | 'workshops' | 'location' | 'brand' | 'other' | string;
  filename?: string;
  title?: string;
  description?: string;
  subcategory?: string;
  property?: string;
  house?: number | null;
  suite?: string | null;
  mediaType?: 'image' | 'video';
  altText?: string;
  isHero?: boolean;
  featured?: boolean;
  published?: boolean;
  sortOrder?: number;
  createdAt?: string;
  thumbnail?: string;
  duration?: string;
  posterImage?: string;
  suiteId?: string;
  quality?: 'Preferred' | 'Alternative' | 'Duplicate' | 'Low Quality' | 'Needs Review';
  status?: 'Approved' | 'Needs Review' | 'Duplicate' | 'Low Quality' | 'Unidentified';
  featuredCandidate?: boolean;
  heroCandidate?: string | boolean;
  socialCandidate?: boolean;
  brandAsset?: boolean;
}

export interface StaffSocialLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
  email?: string;
}

export interface Staff {
  id: string;
  name: string;
  title: string;
  position?: string;
  bio: string;
  avatar: string;
  role: 'owner' | 'manager' | 'concierge' | 'hospitality' | 'security' | 'operations' | string;
  department?: string;
  socialLinks?: StaffSocialLinks;
  order?: number;
}

export interface Amenity {
  id: string;
  name: string;
  category: 'Security & Privacy' | 'Comfort & Climate' | 'Climate & Comfort' | 'Power & Connectivity' | 'Power Reliability' | 'Suite Luxuries' | 'Dining & Refreshments' | 'Location & Transit' | 'Entertainment' | 'Interior Finishes' | 'Estate Infrastructure' | 'Guest Services' | 'Security & Control' | string;
  icon: string;
  description: string;
  isFeatured: boolean;
}

export interface Booking {
  id: string;
  suiteId: string;
  suiteName: string;
  guestId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  totalPrice: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  specialRequests?: string;
  createdAt: string;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city?: string;
  notes?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'cash' | 'card' | 'bank_transfer' | 'mobile_money';
  transactionRef: string;
  createdAt: string;
}

export interface AccessCard {
  id: string;
  bookingId: string;
  guestId: string;
  cardIdentifier: string;
  activatedAt: string;
  expiresAt: string;
  status: 'pending' | 'active' | 'expired' | 'revoked' | 'deactivated';
  cardNumber?: string;
  activeFrom?: string;
  activeTo?: string;
  suiteId?: string;
  suiteName?: string;
}

export interface BusinessConfig {
  name: string;
  tagline: string;
  category: string;
  owner: string;
  location: {
    street: string;
    neighborhood: string;
    city: string;
    region: string;
    country: string;
    fullAddress: string;
    googleMapsUrl: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone: string;
    phoneFormatted: string;
    whatsapp: string;
    whatsappUrl: string;
    email: string;
  };
  socials: {
    instagram: string;
    facebook: string;
    tiktok: string;
  };
  logo: {
    svgPlaceholder: string;
    textMark: string;
  };
  history: {
    establishmentYear: string | number;
    inaugurationYear: string | number;
  };
  jufre?: {
    brandName: string;
    description: string;
    link: string;
  };
  property: {
    totalHouses: number;
    suitesPerHouse: number;
    totalSuites: number;
  };
}
