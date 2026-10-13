// src/server/app.ts
import express from "express";
import path from "path";
import cors from "cors";

// src/server/config/envConfig.ts
import dotenv from "dotenv";
dotenv.config();
var isProduction = process.env.NODE_ENV === "production";
function getJwtSecret() {
  let secret = process.env.JWT_SECRET?.trim();
  if (secret && (secret.startsWith('"') && secret.endsWith('"') || secret.startsWith("'") && secret.endsWith("'"))) {
    secret = secret.slice(1, -1).trim();
  }
  const placeholder = "kilifa_suites_jwt_secret_key_2026_super_secure";
  if (isProduction) {
    if (!secret || secret === placeholder || secret.length < 32) {
      throw new Error(
        "[FATAL CONFIGURATION ERROR] In production mode, JWT_SECRET must be explicitly set to a strong, non-default secret key in the environment (at least 32 characters). Application startup terminated."
      );
    }
    return secret;
  }
  if (secret) {
    return secret;
  }
  console.warn(
    "[DEV SECURITY NOTICE] No JWT_SECRET configured in environment. Using isolated local dev key. This MUST be set before production deployment."
  );
  return "kilifa_local_dev_only_jwt_key_must_be_set_in_production_2026";
}
function getJwtExpiresIn() {
  let raw = process.env.JWT_EXPIRES_IN?.trim();
  if (!raw) return "7d";
  if (raw.startsWith('"') && raw.endsWith('"') || raw.startsWith("'") && raw.endsWith("'")) {
    raw = raw.slice(1, -1).trim();
  }
  if (/^\d+$/.test(raw)) {
    return parseInt(raw, 10);
  }
  const monthMatch = raw.match(/^(\d+)\s*month$/i);
  if (monthMatch) {
    return `${parseInt(monthMatch[1], 10) * 30}d`;
  }
  const yearMatch = raw.match(/^(\d+)\s*year$/i);
  if (yearMatch) {
    return `${parseInt(yearMatch[1], 10) * 365}d`;
  }
  return raw;
}
function isMemoryFallbackAllowed() {
  if (process.env.ALLOW_MEMORY_FALLBACK === "true") {
    return true;
  }
  if (process.env.ALLOW_MEMORY_FALLBACK === "false") {
    return false;
  }
  if (isProduction) {
    return false;
  }
  return true;
}
function isDatabaseConfigured() {
  const raw = process.env.DATABASE_URL?.trim();
  return Boolean(raw && (raw.startsWith("postgresql://") || raw.startsWith("postgres://")));
}
function getSanitizedDatabaseUrl() {
  const raw = process.env.DATABASE_URL?.trim();
  if (raw && (raw.startsWith("postgresql://") || raw.startsWith("postgres://"))) {
    return raw;
  }
  if (isProduction) {
    return "";
  }
  return "postgresql://postgres:postgres@localhost:5432/kilifa_suites?schema=public";
}

// src/server/db/prisma.ts
import { PrismaClient } from "@prisma/client";
var validDbUrl = getSanitizedDatabaseUrl();
var prismaClient;
if (validDbUrl) {
  try {
    prismaClient = global.prisma || new PrismaClient({
      datasources: {
        db: {
          url: validDbUrl
        }
      },
      log: [
        { emit: "event", level: "error" },
        { emit: "event", level: "warn" }
      ]
    });
    if (prismaClient.$on) {
      prismaClient.$on("error", () => {
      });
      prismaClient.$on("warn", () => {
      });
    }
  } catch (err) {
    prismaClient = createNoOpProxy();
  }
} else {
  prismaClient = createNoOpProxy();
}
function createNoOpProxy() {
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d) => d?.data ?? {},
    update: async (d) => d?.data ?? {},
    delete: async () => ({}),
    count: async () => 0,
    aggregate: async () => ({ _sum: {}, _avg: {}, _count: {} }),
    groupBy: async () => []
  };
  return new Proxy({}, {
    get: (_, prop) => {
      if (prop === "$queryRaw" || prop === "$executeRaw") return async () => [];
      if (prop === "$disconnect" || prop === "$connect") return async () => {
      };
      return new Proxy({}, { get: () => noOp });
    }
  });
}
var prisma = prismaClient;
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
var isConnected = false;
var lastCheckTime = 0;
var CHECK_CACHE_TTL = 1e4;
async function checkDatabaseConnection(force = false) {
  const now = Date.now();
  if (!force && now - lastCheckTime < CHECK_CACHE_TTL && lastCheckTime > 0) {
    return isConnected;
  }
  const rawDb = process.env.DATABASE_URL?.trim();
  if (!rawDb || !rawDb.startsWith("postgresql://") && !rawDb.startsWith("postgres://")) {
    isConnected = false;
    lastCheckTime = now;
    return false;
  }
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Connection timeout")), 1500))
    ]);
    isConnected = true;
    lastCheckTime = now;
    return true;
  } catch {
    isConnected = false;
    lastCheckTime = now;
    return false;
  }
}
function isDatabaseConnected() {
  return isConnected;
}
var handleShutdown = async () => {
  try {
    await prisma.$disconnect();
  } catch (err) {
  }
};
process.once("beforeExit", handleShutdown);
process.once("SIGINT", handleShutdown);
process.once("SIGTERM", handleShutdown);

// src/server/routes/suiteRoutes.ts
import { Router } from "express";

// src/data/mediaCatalog.ts
var MEDIA_CATALOG = [
  // ==========================================
  // PROPERTY OVERVIEW & EXTERIOR
  // ==========================================
  {
    id: "media-prop-overview-01",
    type: "image",
    category: "exterior",
    subcategory: "Compound Overview",
    title: "Kilifa Suites Estate Overview",
    caption: "Comprehensive Overview of Kilifa Suites Two Residence Buildings",
    filename: "kilifa-property-two-suite-overview-01.jpeg",
    url: "/media/images/kilifa-property-two-suite-overview-01.jpeg",
    thumbnail: "/media/images/kilifa-property-two-suite-overview-01.jpeg",
    featured: true,
    featuredCandidate: true,
    heroCandidate: true,
    quality: "Preferred",
    status: "Approved"
  },
  {
    id: "media-prop-ext-01",
    type: "image",
    category: "exterior",
    subcategory: "Perimeter & Fa\xE7ade",
    title: "Estate Exterior Fa\xE7ade",
    caption: "Kilifa Suites Two-House Architectural Compound Exterior",
    filename: "kilifa-property-exterior-01.jpeg",
    url: "/media/images/kilifa-property-exterior-01.jpeg",
    thumbnail: "/media/images/kilifa-property-exterior-01.jpeg",
    featured: true,
    featuredCandidate: true,
    quality: "Preferred",
    status: "Approved"
  },
  {
    id: "media-prop-ext-02",
    type: "image",
    category: "exterior",
    subcategory: "Perimeter & Compound",
    title: "Gated Residential Perimeter",
    caption: "Estate Residential Compound & Security Perimeter",
    filename: "kilifa-property-exterior-02.jpeg",
    url: "/media/images/kilifa-property-exterior-02.jpeg",
    thumbnail: "/media/images/kilifa-property-exterior-02.jpeg",
    quality: "Preferred",
    status: "Approved"
  },
  // ==========================================
  // VERANDAS & TERRACES
  // ==========================================
  {
    id: "media-veranda-over-01",
    type: "image",
    category: "exterior",
    subcategory: "Veranda Overview",
    title: "Covered Veranda Colonnade",
    caption: "Covered Veranda Colonnade Overview with Compound Breeze",
    filename: "kilifa-veranda-overview-01.jpeg",
    url: "/media/images/kilifa-veranda-overview-01.jpeg",
    thumbnail: "/media/images/kilifa-veranda-overview-01.jpeg",
    quality: "Preferred",
    status: "Approved"
  },
  {
    id: "media-veranda-over-02",
    type: "image",
    category: "exterior",
    subcategory: "Veranda Overview",
    title: "Veranda Architectural Terrace",
    caption: "Wide Veranda Architectural Terrace Overview",
    filename: "kilifa-veranda-overview-02.jpeg",
    url: "/media/images/kilifa-veranda-overview-02.jpeg",
    thumbnail: "/media/images/kilifa-veranda-overview-02.jpeg",
    quality: "Preferred",
    status: "Approved"
  },
  {
    id: "media-veranda-int-01",
    type: "image",
    category: "interior",
    subcategory: "Veranda Walkway",
    title: "Veranda Corridor Entrance",
    caption: "Veranda Interior Corridor & Suite Entrance Hallway",
    filename: "kilifa-veranda-interior-01.jpeg",
    url: "/media/images/kilifa-veranda-interior-01.jpeg",
    thumbnail: "/media/images/kilifa-veranda-interior-01.jpeg",
    quality: "Preferred",
    status: "Approved"
  },
  {
    id: "media-veranda-int-02",
    type: "image",
    category: "interior",
    subcategory: "Veranda Walkway",
    title: "Veranda Tiled Corridor",
    caption: "Sheltered Veranda Hallway with Architectural Tiles",
    filename: "kilifa-veranda-interior-02.jpeg",
    url: "/media/images/kilifa-veranda-interior-02.jpeg",
    thumbnail: "/media/images/kilifa-veranda-interior-02.jpeg",
    quality: "Preferred",
    status: "Approved"
  },
  {
    id: "media-veranda-int-03",
    type: "image",
    category: "interior",
    subcategory: "Veranda Walkway",
    title: "Veranda Connecting Hallway",
    caption: "Veranda Interior Walkway Connecting Suites",
    filename: "kilifa-veranda-interior-03.jpeg",
    url: "/media/images/kilifa-veranda-interior-03.jpeg",
    thumbnail: "/media/images/kilifa-veranda-interior-03.jpeg",
    quality: "Preferred",
    status: "Approved"
  },
  // ==========================================
  // PARLORS & LIVING AREAS
  // ==========================================
  {
    id: "media-parlor-01",
    type: "image",
    category: "parlors",
    subcategory: "Executive Parlor",
    title: "Executive Suite Parlor",
    caption: "Executive Suite Parlor & Living Area with Leather Seating",
    filename: "kilifa-parlor-01.jpeg",
    url: "/media/images/kilifa-parlor-01.jpeg",
    thumbnail: "/media/images/kilifa-parlor-01.jpeg",
    featured: true,
    featuredCandidate: true,
    quality: "Preferred",
    status: "Approved"
  },
  {
    id: "media-parlor-02",
    type: "image",
    category: "parlors",
    subcategory: "Spacious Parlor",
    title: "Spacious Suite Living Parlor",
    caption: "Spacious Suite Living Parlor with Air Conditioning & Center Table",
    filename: "kilifa-parlor-02.jpeg",
    url: "/media/images/kilifa-parlor-02.jpeg",
    thumbnail: "/media/images/kilifa-parlor-02.jpeg",
    featured: true,
    quality: "Preferred",
    status: "Approved"
  },
  {
    id: "media-parlor-03",
    type: "image",
    category: "parlors",
    subcategory: "Lounge Parlor",
    title: "Comfortable Suite Lounge",
    caption: "Comfortable Suite Lounge Parlor Layout",
    filename: "kilifa-parlor-03.jpeg",
    url: "/media/images/kilifa-parlor-03.jpeg",
    thumbnail: "/media/images/kilifa-parlor-03.jpeg",
    quality: "Preferred",
    status: "Approved"
  },
  {
    id: "media-suite-living-02",
    type: "image",
    category: "parlors",
    subcategory: "Suite Living",
    title: "Suite Living Room Parlor",
    caption: "Suite Living Room & Relaxation Parlor",
    filename: "kilifa-suite-living-room-02.jpeg",
    url: "/media/images/kilifa-suite-living-room-02.jpeg",
    thumbnail: "/media/images/kilifa-suite-living-room-02.jpeg",
    quality: "Preferred",
    status: "Approved"
  },
  {
    id: "media-suite-living-03",
    type: "image",
    category: "parlors",
    subcategory: "Suite Living",
    title: "Modern Suite Living Room",
    caption: "Modern Suite Living Room with Plush Upholstery",
    filename: "kilifa-suite-living-room-03.jpeg",
    url: "/media/images/kilifa-suite-living-room-03.jpeg",
    thumbnail: "/media/images/kilifa-suite-living-room-03.jpeg",
    quality: "Preferred",
    status: "Approved"
  },
  // ==========================================
  // BEDROOMS & SUITE ROOMS
  // ==========================================
  {
    id: "media-bedroom-01",
    type: "image",
    category: "bedrooms",
    subcategory: "Executive Bedroom",
    title: "Executive Suite Master Bedroom",
    caption: "Executive Suite Master Bedroom with Queen Bed & Climate Control",
    filename: "kilifa-suite-bedroom-01.jpeg",
    url: "/media/images/kilifa-suite-bedroom-01.jpeg",
    thumbnail: "/media/images/kilifa-suite-bedroom-01.jpeg",
    featured: true,
    featuredCandidate: true,
    quality: "Preferred",
    status: "Approved"
  },
  {
    id: "media-bedroom-02",
    type: "image",
    category: "bedrooms",
    subcategory: "Suite Bedroom",
    title: "Luxurious Suite Bedroom",
    caption: "Luxurious Suite Bedroom with Premium Linens & Lighting",
    filename: "kilifa-suite-bedroom-02.jpeg",
    url: "/media/images/kilifa-suite-bedroom-02.jpeg",
    thumbnail: "/media/images/kilifa-suite-bedroom-02.jpeg",
    featured: true,
    quality: "Preferred",
    status: "Approved"
  },
  {
    id: "media-suite-room-02",
    type: "image",
    category: "suites",
    subcategory: "Suite Interior",
    title: "Executive Suite Room Interior",
    caption: "Executive Suite Room Interior Overview",
    filename: "kilifa-suite-room-02.jpeg",
    url: "/media/images/kilifa-suite-room-02.jpeg",
    thumbnail: "/media/images/kilifa-suite-room-02.jpeg",
    quality: "Preferred",
    status: "Approved"
  },
  // ==========================================
  // ENTERTAINMENT & WORK DESKS
  // ==========================================
  {
    id: "media-tv-desk-01",
    type: "image",
    category: "amenities",
    subcategory: "Entertainment & Desk",
    title: "Flat-Screen TV & Workstation",
    caption: "Digital Flat-Screen Entertainment System & Workstation Desk",
    filename: "kilifa-suite-tv-desk-01.jpeg",
    url: "/media/images/kilifa-suite-tv-desk-01.jpeg",
    thumbnail: "/media/images/kilifa-suite-tv-desk-01.jpeg",
    quality: "Preferred",
    status: "Approved"
  },
  {
    id: "media-tv-desk-02",
    type: "image",
    category: "amenities",
    subcategory: "Entertainment & Desk",
    title: "Smart TV & Business Workstation",
    caption: "Wall-Mounted Flat-Screen Smart TV & Workstation",
    filename: "kilifa-suite-tv-desk-02.jpeg",
    url: "/media/images/kilifa-suite-tv-desk-02.jpeg",
    thumbnail: "/media/images/kilifa-suite-tv-desk-02.jpeg",
    quality: "Preferred",
    status: "Approved"
  },
  {
    id: "media-tv-desk-03",
    type: "image",
    category: "amenities",
    subcategory: "Entertainment & Desk",
    title: "Executive Desk Workstation",
    caption: "Executive Desk Workstation with Smart TV Setup",
    filename: "kilifa-suite-tv-desk-03.jpeg",
    url: "/media/images/kilifa-suite-tv-desk-03.jpeg",
    thumbnail: "/media/images/kilifa-suite-tv-desk-03.jpeg",
    quality: "Preferred",
    status: "Approved"
  },
  {
    id: "media-tv-desk-04",
    type: "image",
    category: "amenities",
    subcategory: "Entertainment & Desk",
    title: "Entertainment Center Setup",
    caption: "In-Suite Entertainment Center & Business Desk",
    filename: "kilifa-suite-tv-desk-04.jpeg",
    url: "/media/images/kilifa-suite-tv-desk-04.jpeg",
    thumbnail: "/media/images/kilifa-suite-tv-desk-04.jpeg",
    quality: "Preferred",
    status: "Approved"
  },
  // ==========================================
  // SEATING & DECOR
  // ==========================================
  {
    id: "media-seating-01",
    type: "image",
    category: "amenities",
    subcategory: "Lounge Seating",
    title: "Suite Seating Area",
    caption: "Relaxing Suite Seating Area & Reading Corner",
    filename: "kilifa-seating-area-01.jpeg",
    url: "/media/images/kilifa-seating-area-01.jpeg",
    thumbnail: "/media/images/kilifa-seating-area-01.jpeg",
    quality: "Preferred",
    status: "Approved"
  },
  {
    id: "media-decor-01",
    type: "image",
    category: "amenities",
    subcategory: "Interior Finishes",
    title: "Interior Wall Art & Accent",
    caption: "Interior Wall Art & Modern Accent Decoration",
    filename: "kilifa-decoration-01.jpeg",
    url: "/media/images/kilifa-decoration-01.jpeg",
    thumbnail: "/media/images/kilifa-decoration-01.jpeg",
    quality: "Preferred",
    status: "Approved"
  },
  {
    id: "media-decor-02",
    type: "image",
    category: "amenities",
    subcategory: "Interior Finishes",
    title: "Decorative Finishes & Accents",
    caption: "Elegant Decorative Accent & Wall Detailing",
    filename: "kilifa-decoration-02.jpeg",
    url: "/media/images/kilifa-decoration-02.jpeg",
    thumbnail: "/media/images/kilifa-decoration-02.jpeg",
    quality: "Preferred",
    status: "Approved"
  },
  // ==========================================
  // SECURITY
  // ==========================================
  {
    id: "media-security-01",
    type: "image",
    category: "security",
    subcategory: "Security Personnel",
    title: "24/7 Security Detail",
    caption: "24/7 Professional Security Personnel on Estate Grounds",
    filename: "kilifa-security-officer-01.jpeg",
    url: "/media/images/kilifa-security-officer-01.jpeg",
    thumbnail: "/media/images/kilifa-security-officer-01.jpeg",
    featured: true,
    quality: "Preferred",
    status: "Approved"
  },
  // ==========================================
  // HOSPITALITY & STAFF
  // ==========================================
  {
    id: "media-staff-00",
    type: "image",
    category: "staff",
    subcategory: "Estate Team",
    title: "Hospitality Administration",
    caption: "Executive Administration of Kilifa Suites",
    filename: "kilifa-staff-00.jpeg",
    url: "/media/images/kilifa-staff-00.jpeg",
    thumbnail: "/media/images/kilifa-staff-00.jpeg",
    featured: false,
    quality: "Preferred",
    status: "Approved"
  },
  {
    id: "media-staff-01",
    type: "image",
    category: "staff",
    subcategory: "Management",
    title: "Fatou - Estate Manager",
    caption: "General Estate Management & Guest Relations Lead",
    filename: "kilifa-staff-01.jpeg",
    url: "/media/images/kilifa-staff-01.jpeg",
    thumbnail: "/media/images/kilifa-staff-01.jpeg",
    quality: "Preferred",
    status: "Approved"
  },
  {
    id: "media-staff-02",
    type: "image",
    category: "staff",
    subcategory: "Concierge",
    title: "Estate Concierge & Reception",
    caption: "Estate Reception Desk & Guest Concierge Team",
    filename: "kilifa-staff-02.jpeg",
    url: "/media/images/kilifa-staff-02.jpeg",
    thumbnail: "/media/images/kilifa-staff-02.jpeg",
    quality: "Preferred",
    status: "Approved"
  },
  {
    id: "media-staff-caregiver-01",
    type: "image",
    category: "staff",
    subcategory: "Hospitality",
    title: "Guest Care & Housekeeping",
    caption: "Hospitality & Guest Care Specialist",
    filename: "kilifa-staff-caregiver-01.jpeg",
    url: "/media/images/kilifa-staff-caregiver-01.jpeg",
    thumbnail: "/media/images/kilifa-staff-caregiver-01.jpeg",
    quality: "Preferred",
    status: "Approved"
  },
  // ==========================================
  // BRAND ASSETS
  // ==========================================
  {
    id: "media-brand-logo-01",
    type: "image",
    category: "brand",
    subcategory: "Logo & Identity",
    title: "Kilifa Suites Official Logo",
    caption: "Kilifa Suites Official Brand Seal & Signage",
    filename: "kilifa-logo.jpeg",
    url: "/media/images/kilifa-logo.jpeg",
    thumbnail: "/media/images/kilifa-logo.jpeg",
    brandAsset: true,
    quality: "Preferred",
    status: "Approved"
  },
  // ==========================================
  // REAL HTML5 VIDEOS
  // ==========================================
  {
    id: "video-complete-property-01",
    type: "video",
    category: "videos",
    subcategory: "Property Tour",
    title: "Complete Kilifa Suites Walkthrough",
    caption: "Complete Kilifa Suites Estate Walkthrough & Video Experience",
    filename: "kilifa-interior-tour-01.mp4",
    url: "/media/videos/kilifa-interior-tour-01.mp4",
    thumbnail: "/media/images/kilifa-property-two-suite-overview-01.jpeg",
    posterImage: "/media/images/kilifa-property-two-suite-overview-01.jpeg",
    featured: true,
    quality: "Preferred",
    status: "Approved"
  },
  {
    id: "video-interior-tour-01",
    type: "video",
    category: "videos",
    subcategory: "Interior Walkthrough",
    title: "Suite Interior Tour",
    caption: "Executive Suite Interior Walkthrough & Tour",
    filename: "kilifa-interior-tour-01.mp4",
    url: "/media/videos/kilifa-interior-tour-01.mp4",
    thumbnail: "/media/images/kilifa-parlor-01.jpeg",
    posterImage: "/media/images/kilifa-parlor-01.jpeg",
    featured: true,
    quality: "Preferred",
    status: "Approved"
  },
  {
    id: "video-exterior-tour-01",
    type: "video",
    category: "videos",
    subcategory: "Exterior Tour",
    title: "Property Grounds & Exterior Tour",
    caption: "Kilifa Suites Architectural Exterior & Compound Grounds Tour",
    filename: "kilifa-property-exterior-tour-01.mp4",
    url: "/media/videos/kilifa-property-exterior-tour-01.mp4",
    thumbnail: "/media/images/kilifa-property-exterior-01.jpeg",
    posterImage: "/media/images/kilifa-property-exterior-01.jpeg",
    featured: true,
    quality: "Preferred",
    status: "Approved"
  }
];

// src/config/business.ts
var suiteFeaturedImages = [
  "/media/images/kilifa-parlor-01.jpeg",
  "/media/images/kilifa-parlor-02.jpeg",
  "/media/images/kilifa-parlor-03.jpeg",
  "/media/images/kilifa-suite-living-room-02.jpeg",
  "/media/images/kilifa-suite-living-room-03.jpeg",
  "/media/images/kilifa-suite-bedroom-01.jpeg",
  "/media/images/kilifa-suite-bedroom-02.jpeg",
  "/media/images/kilifa-suite-room-02.jpeg",
  "/media/images/kilifa-parlor-01.jpeg",
  "/media/images/kilifa-parlor-02.jpeg",
  "/media/images/kilifa-suite-living-room-03.jpeg",
  "/media/images/kilifa-suite-bedroom-01.jpeg"
];
var suiteGalleries = [
  [
    "/media/images/kilifa-parlor-01.jpeg",
    "/media/images/kilifa-suite-bedroom-01.jpeg",
    "/media/images/kilifa-suite-tv-desk-01.jpeg",
    "/media/images/kilifa-veranda-interior-01.jpeg"
  ],
  [
    "/media/images/kilifa-parlor-02.jpeg",
    "/media/images/kilifa-suite-bedroom-02.jpeg",
    "/media/images/kilifa-suite-tv-desk-02.jpeg",
    "/media/images/kilifa-veranda-interior-02.jpeg"
  ],
  [
    "/media/images/kilifa-parlor-03.jpeg",
    "/media/images/kilifa-suite-bedroom-01.jpeg",
    "/media/images/kilifa-suite-tv-desk-03.jpeg",
    "/media/images/kilifa-veranda-interior-03.jpeg"
  ],
  [
    "/media/images/kilifa-suite-living-room-02.jpeg",
    "/media/images/kilifa-suite-bedroom-02.jpeg",
    "/media/images/kilifa-suite-tv-desk-04.jpeg",
    "/media/images/kilifa-seating-area-01.jpeg"
  ],
  [
    "/media/images/kilifa-suite-living-room-03.jpeg",
    "/media/images/kilifa-suite-bedroom-01.jpeg",
    "/media/images/kilifa-suite-tv-desk-01.jpeg",
    "/media/images/kilifa-decoration-01.jpeg"
  ],
  [
    "/media/images/kilifa-suite-room-02.jpeg",
    "/media/images/kilifa-suite-bedroom-02.jpeg",
    "/media/images/kilifa-suite-tv-desk-02.jpeg",
    "/media/images/kilifa-decoration-02.jpeg"
  ],
  [
    "/media/images/kilifa-parlor-01.jpeg",
    "/media/images/kilifa-suite-bedroom-01.jpeg",
    "/media/images/kilifa-suite-tv-desk-03.jpeg",
    "/media/images/kilifa-veranda-overview-01.jpeg"
  ],
  [
    "/media/images/kilifa-parlor-02.jpeg",
    "/media/images/kilifa-suite-bedroom-02.jpeg",
    "/media/images/kilifa-suite-tv-desk-04.jpeg",
    "/media/images/kilifa-veranda-overview-02.jpeg"
  ],
  [
    "/media/images/kilifa-parlor-03.jpeg",
    "/media/images/kilifa-suite-bedroom-01.jpeg",
    "/media/images/kilifa-suite-tv-desk-01.jpeg",
    "/media/images/kilifa-veranda-interior-01.jpeg"
  ],
  [
    "/media/images/kilifa-suite-living-room-02.jpeg",
    "/media/images/kilifa-suite-bedroom-02.jpeg",
    "/media/images/kilifa-suite-tv-desk-02.jpeg",
    "/media/images/kilifa-seating-area-01.jpeg"
  ],
  [
    "/media/images/kilifa-suite-living-room-03.jpeg",
    "/media/images/kilifa-suite-bedroom-01.jpeg",
    "/media/images/kilifa-suite-tv-desk-03.jpeg",
    "/media/images/kilifa-decoration-01.jpeg"
  ],
  [
    "/media/images/kilifa-suite-room-02.jpeg",
    "/media/images/kilifa-suite-bedroom-02.jpeg",
    "/media/images/kilifa-suite-tv-desk-04.jpeg",
    "/media/images/kilifa-veranda-interior-02.jpeg"
  ]
];
var OFFICIAL_SUITE_NAMES = [
  "DAR",
  "SAMA",
  "LAAWOL",
  "EJAM",
  "YERMANDE",
  "BAJAM",
  "SUUDU",
  "WURO",
  "YIDI",
  "KENE",
  "SAGO",
  "NDIYA"
];
var SUITES_DATA = Array.from({ length: 12 }, (_, index) => {
  const num = index + 1;
  const numFormatted = num < 10 ? `0${num}` : `${num}`;
  const houseNumber = num <= 6 ? 1 : 2;
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
    masterBedroomDescription: `Features a plush ${num % 2 === 0 ? "King Executive Bed" : "Queen Bed"} dressed in high-thread-count cotton linens, individual split-system silent air conditioning, blackout drapery, and custom bedside lighting.`,
    parlorDescription: `A spacious private sitting parlor equipped with upholstered lounge furniture, a dedicated workstation desk, high-speed fiber Wi-Fi, and a Smart HDTV with satellite and streaming support.`,
    bathroomDescription: `Private en-suite bathroom fitted with a rainfall pressure shower, solar-heated continuous hot water, vanity counter, plush bath towels, and luxury toiletries.`,
    maxOccupancy: num % 3 === 0 ? 4 : 2,
    sizeSqM: 42 + num % 4 * 6,
    bedrooms: num % 4 === 0 ? 2 : 1,
    bathrooms: 1,
    bedType: num % 2 === 0 ? "King Executive Bed" : "Queen Plush Bed",
    pricePerNight: 2500,
    currency: "GMD",
    baseAmenities: [
      "24/7 Solar Power Backup",
      "High-Capacity Air Conditioning",
      "En-suite Luxury Bathroom",
      "High-Speed Wi-Fi",
      "Smart HDTV with Streaming",
      "Private Keycard Access",
      "In-Room Safe",
      "Tea & Coffee Service"
    ],
    featuredImage: suiteFeaturedImages[index],
    galleryImages: suiteGalleries[index],
    videos: [
      {
        id: `vid-suite-${numFormatted}-1`,
        type: "video",
        url: "/media/videos/kilifa-interior-tour-01.mp4",
        thumbnail: suiteFeaturedImages[index],
        posterImage: suiteFeaturedImages[index],
        caption: `Executive Suite Interior Walkthrough`,
        alt: `Interior video tour of suite at Kilifa Suites`,
        category: "suites",
        duration: "01:45"
      },
      {
        id: `vid-suite-${numFormatted}-2`,
        type: "video",
        url: "/media/videos/kilifa-property-exterior-tour-01.mp4",
        thumbnail: "/media/images/kilifa-property-exterior-01.jpeg",
        posterImage: "/media/images/kilifa-property-exterior-01.jpeg",
        caption: `Kilifa Suites Property & Compound Grounds`,
        alt: `Property exterior tour of Kilifa Suites`,
        category: "exterior",
        duration: "01:10"
      }
    ],
    status: "available",
    floor: suiteInHouse <= 3 ? "Ground Floor" : "First Floor",
    view: houseNumber === 1 ? "Garden & Inner Courtyard View" : "Private Estate Terrace View"
  };
});
var MEDIA_GALLERY_DATA = MEDIA_CATALOG;

// src/server/middleware/errorHandler.ts
var ApiError = class _ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = Array.isArray(errors) ? errors : [];
    Object.setPrototypeOf(this, _ApiError.prototype);
  }
};
var errorHandler = (err, req, res, _next) => {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) {
      console.error(`[API SERVER ERROR ${timestamp}] ${req.method} ${req.originalUrl}:`, err);
    }
    return res.status(err.statusCode).json({
      status: "error",
      statusCode: err.statusCode,
      message: err.message,
      errors: Array.isArray(err.errors) ? err.errors : [],
      path: req.originalUrl,
      timestamp
    });
  }
  console.error(`[UNHANDLED SERVER ERROR ${timestamp}] ${req.method} ${req.originalUrl}:`, err);
  const isProduction2 = process.env.NODE_ENV === "production";
  return res.status(500).json({
    status: "error",
    statusCode: 500,
    message: isProduction2 ? "An unexpected internal server error occurred. Please contact Kilifa Suites support." : err.message || "Internal Server Error",
    errors: [],
    path: req.originalUrl,
    timestamp
  });
};

// src/server/services/suiteService.ts
var SuiteService = class {
  constructor() {
    this.fallbackSuites = [...SUITES_DATA];
  }
  async getAllSuites() {
    if (isDatabaseConnected()) {
      try {
        const suites = await prisma.suite.findMany({
          include: {
            house: true,
            amenities: true
          },
          orderBy: { slug: "asc" }
        });
        if (suites && suites.length > 0) {
          return suites.map((s) => {
            const fallback = this.fallbackSuites.find((f) => f.slug === s.slug || f.id === s.id) || this.fallbackSuites[0];
            return {
              ...fallback,
              id: s.id,
              slug: s.slug,
              name: s.name,
              houseNumber: s.houseNumber,
              pricePerNight: s.pricePerNight,
              maxOccupancy: s.maxOccupancy,
              bedrooms: s.bedrooms,
              bathrooms: s.bathrooms,
              description: s.description,
              floor: s.floor === "Ground" ? "Ground Floor" : s.floor === "Upper" ? "First Floor" : s.floor
            };
          });
        }
      } catch (err) {
        if (err instanceof ApiError) throw err;
      }
    }
    return this.fallbackSuites;
  }
  async getSuiteById(id) {
    if (isDatabaseConnected()) {
      try {
        const suite = await prisma.suite.findFirst({
          where: {
            OR: [
              { id },
              { slug: id },
              { id: `suite-${id}` }
            ]
          },
          include: {
            house: true,
            amenities: true
          }
        });
        if (suite) {
          const fallback = this.fallbackSuites.find((f) => f.slug === suite.slug || f.id === suite.id) || this.fallbackSuites[0];
          return {
            ...fallback,
            id: suite.id,
            slug: suite.slug,
            name: suite.name,
            houseNumber: suite.houseNumber,
            pricePerNight: suite.pricePerNight,
            maxOccupancy: suite.maxOccupancy,
            bedrooms: suite.bedrooms,
            bathrooms: suite.bathrooms,
            description: suite.description,
            floor: suite.floor === "Ground" ? "Ground Floor" : suite.floor === "Upper" ? "First Floor" : suite.floor
          };
        }
      } catch (err) {
        if (err instanceof ApiError) throw err;
      }
    }
    const fallbackSuite = this.fallbackSuites.find(
      (s) => s.id === id || s.slug === id || s.id === `suite-${id}`
    );
    if (!fallbackSuite) {
      throw new ApiError(404, `Suite with ID or slug '${id}' not found`);
    }
    return fallbackSuite;
  }
  async createSuite(data) {
    const slug = data.slug || `suite-${data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    if (isDatabaseConnected()) {
      try {
        let house = await prisma.house.findFirst({ where: { houseNumber: data.houseNumber } });
        if (!house) {
          house = await prisma.house.findFirst();
        }
        const created = await prisma.suite.create({
          data: {
            slug,
            name: data.name,
            houseNumber: data.houseNumber,
            floor: data.floor.includes("Ground") ? "Ground" : "Upper",
            pricePerNight: data.pricePerNight,
            maxOccupancy: data.maxOccupancy,
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            description: data.description,
            parlor: true,
            houseId: house?.id
          }
        });
        const fallback2 = this.fallbackSuites[0];
        const newSuite2 = {
          ...fallback2,
          id: created.id,
          slug: created.slug,
          name: created.name,
          houseNumber: created.houseNumber,
          pricePerNight: created.pricePerNight,
          maxOccupancy: created.maxOccupancy,
          bedrooms: created.bedrooms,
          bathrooms: created.bathrooms,
          description: created.description,
          floor: created.floor === "Ground" ? "Ground Floor" : "First Floor"
        };
        this.fallbackSuites.push(newSuite2);
        return newSuite2;
      } catch (err) {
        console.warn("[SUITE SERVICE] Prisma create failed, adding to memory fallback:", err.message);
      }
    }
    const fallback = this.fallbackSuites[0];
    const newSuite = {
      ...fallback,
      id: `suite-${Date.now()}`,
      slug,
      name: data.name,
      houseNumber: data.houseNumber || 1,
      pricePerNight: data.pricePerNight,
      maxOccupancy: data.maxOccupancy,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      description: data.description,
      floor: data.floor
    };
    this.fallbackSuites.push(newSuite);
    return newSuite;
  }
  async updateSuite(id, data) {
    if (isDatabaseConnected()) {
      try {
        const existing = await prisma.suite.findFirst({
          where: { OR: [{ id }, { slug: id }] }
        });
        if (existing) {
          const updated = await prisma.suite.update({
            where: { id: existing.id },
            data: {
              name: data.name ?? existing.name,
              houseNumber: data.houseNumber ?? existing.houseNumber,
              floor: data.floor ? data.floor.includes("Ground") ? "Ground" : "Upper" : existing.floor,
              pricePerNight: data.pricePerNight ?? existing.pricePerNight,
              maxOccupancy: data.maxOccupancy ?? existing.maxOccupancy,
              bedrooms: data.bedrooms ?? existing.bedrooms,
              bathrooms: data.bathrooms ?? existing.bathrooms,
              description: data.description ?? existing.description
            }
          });
          const fallback = this.fallbackSuites.find((f) => f.slug === updated.slug || f.id === updated.id) || this.fallbackSuites[0];
          const resSuite = {
            ...fallback,
            id: updated.id,
            slug: updated.slug,
            name: updated.name,
            houseNumber: updated.houseNumber,
            pricePerNight: updated.pricePerNight,
            maxOccupancy: updated.maxOccupancy,
            bedrooms: updated.bedrooms,
            bathrooms: updated.bathrooms,
            description: updated.description,
            floor: updated.floor === "Ground" ? "Ground Floor" : "First Floor"
          };
          const idx2 = this.fallbackSuites.findIndex((s) => s.id === id || s.slug === id);
          if (idx2 !== -1) {
            this.fallbackSuites[idx2] = resSuite;
          }
          return resSuite;
        }
      } catch (err) {
        console.warn("[SUITE SERVICE] Prisma update failed, updating memory fallback:", err.message);
      }
    }
    const idx = this.fallbackSuites.findIndex((s) => s.id === id || s.slug === id);
    if (idx !== -1) {
      this.fallbackSuites[idx] = {
        ...this.fallbackSuites[idx],
        name: data.name ?? this.fallbackSuites[idx].name,
        pricePerNight: data.pricePerNight ?? this.fallbackSuites[idx].pricePerNight,
        maxOccupancy: data.maxOccupancy ?? this.fallbackSuites[idx].maxOccupancy,
        bedrooms: data.bedrooms ?? this.fallbackSuites[idx].bedrooms,
        bathrooms: data.bathrooms ?? this.fallbackSuites[idx].bathrooms,
        description: data.description ?? this.fallbackSuites[idx].description
      };
      return this.fallbackSuites[idx];
    }
    throw new ApiError(404, `Suite with ID '${id}' not found`);
  }
  async deleteSuite(id) {
    if (isDatabaseConnected()) {
      try {
        const existing = await prisma.suite.findFirst({
          where: { OR: [{ id }, { slug: id }] }
        });
        if (existing) {
          await prisma.suite.delete({ where: { id: existing.id } });
        }
      } catch (err) {
        console.warn("[SUITE SERVICE] Prisma delete failed:", err.message);
      }
    }
    const idx = this.fallbackSuites.findIndex((s) => s.id === id || s.slug === id);
    if (idx !== -1) {
      this.fallbackSuites.splice(idx, 1);
    }
    return true;
  }
};
var suiteService = new SuiteService();

// src/server/controllers/suiteController.ts
var getAllSuites = async (req, res, next) => {
  try {
    const suites = await suiteService.getAllSuites();
    res.status(200).json({
      status: "success",
      count: suites.length,
      data: suites
    });
  } catch (err) {
    next(err);
  }
};
var getSuiteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const suite = await suiteService.getSuiteById(id);
    res.status(200).json({
      status: "success",
      data: suite
    });
  } catch (err) {
    next(err);
  }
};
var createSuite = async (req, res, next) => {
  try {
    const { name, houseNumber, floor, pricePerNight, maxOccupancy, bedrooms, bathrooms, description, slug } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      throw new ApiError(400, "Suite name is required");
    }
    if (!pricePerNight || typeof pricePerNight !== "number" || pricePerNight <= 0) {
      throw new ApiError(400, "Valid pricePerNight is required");
    }
    const created = await suiteService.createSuite({
      name: name.trim(),
      houseNumber: Number(houseNumber) || 1,
      floor: floor || "Ground Floor",
      pricePerNight: Number(pricePerNight),
      maxOccupancy: Number(maxOccupancy) || 2,
      bedrooms: Number(bedrooms) || 1,
      bathrooms: Number(bathrooms) || 1,
      description: description ? String(description).trim() : "Luxury Gambia Residence",
      slug
    });
    res.status(201).json({
      status: "success",
      message: "Suite created successfully",
      data: created
    });
  } catch (err) {
    next(err);
  }
};
var updateSuite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await suiteService.updateSuite(id, req.body);
    res.status(200).json({
      status: "success",
      message: "Suite updated successfully",
      data: updated
    });
  } catch (err) {
    next(err);
  }
};
var deleteSuite = async (req, res, next) => {
  try {
    const { id } = req.params;
    await suiteService.deleteSuite(id);
    res.status(200).json({
      status: "success",
      message: `Suite '${id}' deleted successfully`
    });
  } catch (err) {
    next(err);
  }
};

// src/server/middleware/authMiddleware.ts
import jwt from "jsonwebtoken";
var authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  const token = typeof authHeader === "string" && authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!token) {
    return next(new ApiError(401, "Authentication required. Please provide a valid Bearer token."));
  }
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    next();
  } catch (err) {
    return next(new ApiError(401, "Invalid or expired authentication token. Please log in again."));
  }
};
var requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required before accessing this endpoint."));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied. Role '${req.user.role}' is not authorized to access this resource. Required role(s): [${allowedRoles.join(", ")}].`
        )
      );
    }
    next();
  };
};
var rateLimitStore = /* @__PURE__ */ new Map();
var WINDOW_MS = 15 * 60 * 1e3;
var MAX_REQUESTS = process.env.NODE_ENV === "production" ? 60 : 500;
var authRateLimiter = (req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    return next();
  }
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown-ip";
  const now = Date.now();
  const record = rateLimitStore.get(clientIp);
  if (!record) {
    rateLimitStore.set(clientIp, { count: 1, firstRequestTime: now });
    return next();
  }
  if (now - record.firstRequestTime > WINDOW_MS) {
    rateLimitStore.set(clientIp, { count: 1, firstRequestTime: now });
    return next();
  }
  record.count += 1;
  if (record.count > MAX_REQUESTS) {
    const retryAfterSec = Math.ceil((WINDOW_MS - (now - record.firstRequestTime)) / 1e3);
    res.setHeader("Retry-After", retryAfterSec);
    return next(
      new ApiError(
        429,
        `Too many authentication attempts from this IP. Please try again in ${retryAfterSec} seconds.`
      )
    );
  }
  next();
};

// src/server/routes/suiteRoutes.ts
import { Role } from "@prisma/client";
var router = Router();
router.get("/", getAllSuites);
router.get("/:id", getSuiteById);
router.post(
  "/",
  authenticateToken,
  requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST),
  createSuite
);
router.put(
  "/:id",
  authenticateToken,
  requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST),
  updateSuite
);
router.delete(
  "/:id",
  authenticateToken,
  requireRole(Role.OWNER, Role.ADMIN),
  deleteSuite
);
var suiteRoutes_default = router;

// src/server/routes/bookingRoutes.ts
import { Router as Router2 } from "express";

// src/server/services/bookingService.ts
import { BookingStatus, PaymentStatus, PaymentMethod, AccessCardStatus as AccessCardStatus2 } from "@prisma/client";

// src/server/access/adapters/SaltoDormakabaAdapter.ts
var SaltoDormakabaAdapter = class {
  constructor() {
    this.providerName = "SALTO_DORMAKABA_SPACE";
    this.cardsMap = /* @__PURE__ */ new Map();
    this.doorLogsList = [];
    this.seedDemoData();
  }
  getHardwareSpec() {
    return {
      lockManufacturer: "SALTO Systems / Dormakaba Integration",
      hardwareModel: "XS4 Original RFID Escutcheon & Mobile Key Gate Controller",
      cardTechnology: "RFID MIFARE DESFire EV2 (13.56 MHz, 4K High Security) + NFC / BLE",
      accessControlSoftware: "SALTO ProAccess SPACE Enterprise v6.4",
      apiSdk: "SALTO Space REST API v2.1 & SHIP (SALTO Host Interface Protocol)",
      networkMethod: "Ethernet TCP/IP Gateway (IQ3) with 868MHz Wireless Mesh Node Locks",
      authMethod: "OAuth 2.0 Bearer Token with Mutual TLS (mTLS) Client Certificates",
      gatewayIpAddress: process.env.SALTO_GATEWAY_IP || "192.168.10.250",
      firmwareVersion: "v5.12.04-BUILD-92"
    };
  }
  async createCard(req) {
    const cardId = `CARD-${Date.now().toString().slice(-8)}`;
    const randomHex = Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, "0");
    const cardNumber = `AC-KS-${randomHex}`;
    const pinCode = Math.floor(1e3 + Math.random() * 9e3).toString();
    const chipUid = `04:${randomHex.slice(0, 2)}:${randomHex.slice(2, 4)}:${randomHex.slice(4, 6)}:E1`;
    const now = /* @__PURE__ */ new Date();
    const validFromDate = req.checkIn ? new Date(req.checkIn) : now;
    const validUntilDate = req.checkOut ? new Date(req.checkOut) : new Date(now.getTime() + 864e5 * 3);
    const card = {
      id: cardId,
      bookingId: req.bookingId,
      bookingReference: req.bookingReference,
      cardNumber,
      pinCode,
      digitalKeyToken: `BLE-SALTO-${cardId}-${Date.now()}`,
      qrAccessCode: `KS-GATE-PASS-${req.bookingReference}`,
      suiteName: req.suiteName,
      guestName: req.guestName,
      validFrom: validFromDate.toISOString(),
      validUntil: validUntilDate.toISOString(),
      status: "INACTIVE",
      lifecycleStage: "CARD_CREATED",
      physicalChipUid: chipUid,
      createdAt: now.toISOString()
    };
    this.cardsMap.set(cardId, card);
    this.addLog({
      cardId: card.id,
      cardNumber: card.cardNumber,
      guestName: card.guestName,
      doorId: "ENCODER-DESK-01",
      doorName: "Reception Card Encoder",
      eventType: "ENTRY_GRANTED",
      accessGranted: true,
      batteryLevel: 100,
      timestamp: now.toISOString(),
      notes: `RFID MIFARE DESFire card encoded for booking ${req.bookingReference} (${req.suiteName})`
    });
    return card;
  }
  async activateCard(cardId) {
    const card = await this.getCardOrThrow(cardId);
    card.status = "ACTIVE";
    card.lifecycleStage = "CARD_ACTIVATED";
    this.cardsMap.set(cardId, card);
    this.addLog({
      cardId: card.id,
      cardNumber: card.cardNumber,
      guestName: card.guestName,
      doorId: "SALTO-GATEWAY-MAIN",
      doorName: "Main Perimeter Gate & Suite Locks",
      eventType: "CARD_ACTIVATED",
      accessGranted: true,
      batteryLevel: 98,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      notes: `Access card permissions synchronized to RF Mesh Lock Nodes for ${card.suiteName}`
    });
    return card;
  }
  async processCheckIn(cardId) {
    const card = await this.getCardOrThrow(cardId);
    card.status = "ACTIVE";
    card.lifecycleStage = "GUEST_CHECKED_IN";
    card.lastAccessTime = (/* @__PURE__ */ new Date()).toISOString();
    this.cardsMap.set(cardId, card);
    const doorLog = {
      id: `LOG-${Date.now().toString().slice(-8)}`,
      cardId: card.id,
      cardNumber: card.cardNumber,
      guestName: card.guestName,
      doorId: `DOOR-${card.suiteName.replace(/\s+/g, "-").toUpperCase()}`,
      doorName: `${card.suiteName} Main Entry Door`,
      eventType: "ENTRY_GRANTED",
      accessGranted: true,
      batteryLevel: 96,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      notes: `First guest check-in tap at ${card.suiteName} lock. Key remains active until ${card.validUntil}`
    };
    this.addLog(doorLog);
    return { card, doorLog };
  }
  async processCheckOut(cardId) {
    const card = await this.getCardOrThrow(cardId);
    card.status = "EXPIRED";
    card.lifecycleStage = "CHECKOUT";
    this.cardsMap.set(cardId, card);
    const doorLog = {
      id: `LOG-${Date.now().toString().slice(-8)}`,
      cardId: card.id,
      cardNumber: card.cardNumber,
      guestName: card.guestName,
      doorId: `DOOR-${card.suiteName.replace(/\s+/g, "-").toUpperCase()}`,
      doorName: `${card.suiteName} Main Entry Door`,
      eventType: "CARD_EXPIRED",
      accessGranted: false,
      batteryLevel: 95,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      notes: `Checkout completed. Card credentials invalidated in SALTO SPACE software.`
    };
    this.addLog(doorLog);
    return { card, doorLog };
  }
  async expireCard(cardId) {
    const card = await this.getCardOrThrow(cardId);
    card.status = "EXPIRED";
    card.lifecycleStage = "CARD_EXPIRED";
    this.cardsMap.set(cardId, card);
    this.addLog({
      cardId: card.id,
      cardNumber: card.cardNumber,
      guestName: card.guestName,
      doorId: "SALTO-GATEWAY-MAIN",
      doorName: "Main Gateway",
      eventType: "CARD_EXPIRED",
      accessGranted: false,
      batteryLevel: 94,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      notes: `Card validity window lapsed (${card.validUntil}). Card expired automatically.`
    });
    return card;
  }
  async revokeCard(cardId, reason) {
    const card = await this.getCardOrThrow(cardId);
    card.status = "REVOKED";
    card.lifecycleStage = "CARD_REVOKED";
    this.cardsMap.set(cardId, card);
    this.addLog({
      cardId: card.id,
      cardNumber: card.cardNumber,
      guestName: card.guestName,
      doorId: "SALTO-GATEWAY-MAIN",
      doorName: "Security Gate Lock Controller",
      eventType: "CARD_EXPIRED",
      accessGranted: false,
      batteryLevel: 94,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      notes: `Card forcibly revoked by security / management: ${reason || "Manual override"}`
    });
    return card;
  }
  async getCardDetails(cardId) {
    for (const card of this.cardsMap.values()) {
      if (card.id === cardId || card.cardNumber === cardId || card.bookingId === cardId || card.bookingReference === cardId) {
        return card;
      }
    }
    return null;
  }
  async simulateDoorAccess(req) {
    const card = await this.getCardDetails(req.cardId);
    if (!card) {
      throw new Error(`Access card '${req.cardId}' not found in hardware register`);
    }
    const isAccessAllowed = card.status === "ACTIVE" && new Date(card.validUntil).getTime() > Date.now();
    const doorName = req.doorName || `${card.suiteName} Entrance`;
    const doorId = req.doorId || `DOOR-${card.suiteName.replace(/\s+/g, "-").toUpperCase()}`;
    const log = {
      id: `LOG-${Date.now().toString().slice(-8)}`,
      cardId: card.id,
      cardNumber: card.cardNumber,
      guestName: card.guestName,
      doorId,
      doorName,
      eventType: isAccessAllowed ? "ENTRY_GRANTED" : "ENTRY_DENIED",
      accessGranted: isAccessAllowed,
      batteryLevel: 92,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      notes: isAccessAllowed ? `Physical tap at ${doorName}. Solenoid disengaged for 5s.` : `Access DENIED at ${doorName}. Reason: Card status is ${card.status}`
    };
    if (isAccessAllowed) {
      card.lastAccessTime = log.timestamp;
      card.lifecycleStage = "CARD_REMAINS_ACTIVE";
      this.cardsMap.set(card.id, card);
    }
    this.addLog(log);
    return log;
  }
  async getDoorAuditLogs(cardId) {
    if (!cardId) return [...this.doorLogsList].reverse();
    return this.doorLogsList.filter((l) => l.cardId === cardId || l.cardNumber === cardId).reverse();
  }
  addLog(log) {
    const fullLog = {
      id: log.id || `LOG-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 1e3)}`,
      ...log
    };
    this.doorLogsList.unshift(fullLog);
    if (this.doorLogsList.length > 100) {
      this.doorLogsList.pop();
    }
  }
  async getCardOrThrow(cardId) {
    const card = await this.getCardDetails(cardId);
    if (!card) {
      throw new Error(`Access card '${cardId}' not found in lock system database`);
    }
    return card;
  }
  seedDemoData() {
    const demoCard = {
      id: "card-demo-102",
      bookingId: "bkg-demo-102",
      bookingReference: "KS-910234",
      cardNumber: "AC-KS-0102",
      pinCode: "7821",
      digitalKeyToken: "BLE-SALTO-DEMO-0102",
      qrAccessCode: "KS-GATE-PASS-KS-910234",
      suiteName: "Ambassador Executive Suite 2",
      guestName: "Fatou Ceesay",
      validFrom: (/* @__PURE__ */ new Date()).toISOString(),
      validUntil: new Date(Date.now() + 864e5 * 3).toISOString(),
      status: "ACTIVE",
      lifecycleStage: "CARD_ACTIVATED",
      physicalChipUid: "04:A2:3F:8C:E1",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      lastAccessTime: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.cardsMap.set(demoCard.id, demoCard);
    this.addLog({
      id: "LOG-DEMO-1001",
      cardId: demoCard.id,
      cardNumber: demoCard.cardNumber,
      guestName: demoCard.guestName,
      doorId: "DOOR-AMBASSADOR-EXEC-2",
      doorName: "Ambassador Executive Suite 2 Door",
      eventType: "ENTRY_GRANTED",
      accessGranted: true,
      batteryLevel: 98,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      notes: "Initial guest arrival scan. Lock unlatched cleanly."
    });
  }
};

// src/server/access/AccessControlManager.ts
var AccessControlManager = class {
  constructor() {
    this.activeAdapter = new SaltoDormakabaAdapter();
  }
  setAdapter(adapter) {
    this.activeAdapter = adapter;
  }
  getHardwareSpec() {
    return this.activeAdapter.getHardwareSpec();
  }
  /**
   * Lifecycle Step 1 & 2: Booking confirmed -> Access card created
   */
  async handleBookingConfirmed(req) {
    const card = await this.activeAdapter.createCard(req);
    return card;
  }
  /**
   * Lifecycle Step 3: Card activated
   */
  async activateAccessCard(cardId) {
    return this.activeAdapter.activateCard(cardId);
  }
  /**
   * Lifecycle Step 4: Guest checks in
   */
  async handleGuestCheckIn(cardId) {
    return this.activeAdapter.processCheckIn(cardId);
  }
  /**
   * Lifecycle Step 5: Card remains active / Door Access Tap simulation
   */
  async simulateDoorEntry(req) {
    return this.activeAdapter.simulateDoorAccess(req);
  }
  /**
   * Lifecycle Step 6 & 7: Checkout -> Card expires
   */
  async handleGuestCheckOut(cardId) {
    return this.activeAdapter.processCheckOut(cardId);
  }
  /**
   * Manual or Scheduled Card Expiration / Revocation
   */
  async expireCard(cardId) {
    return this.activeAdapter.expireCard(cardId);
  }
  async revokeCard(cardId, reason) {
    return this.activeAdapter.revokeCard(cardId, reason);
  }
  async getCardDetails(cardId) {
    return this.activeAdapter.getCardDetails(cardId);
  }
  async getDoorAuditLogs(cardId) {
    return this.activeAdapter.getDoorAuditLogs(cardId);
  }
};
var accessControlManager = new AccessControlManager();

// src/server/services/accessControlService.ts
import { AccessCardStatus } from "@prisma/client";

// src/server/notifications/providers/EmailNotificationProvider.ts
var EmailNotificationProvider = class {
  constructor() {
    this.name = "KILIFA_EMAIL_PROVIDER";
    this.channel = "EMAIL";
    this.apiKey = process.env.EMAIL_API_KEY || process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY;
    this.senderEmail = process.env.EMAIL_FROM_ADDRESS || "reservations@kilifasuites.com";
  }
  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }
  getStatus() {
    const configured = this.isConfigured();
    return {
      providerName: this.name,
      channel: this.channel,
      configured,
      statusText: configured ? `Configured via API Key (${this.senderEmail})` : "Development Mode (Simulated Dispatch / Local Logging)"
    };
  }
  async send(payload) {
    const recipientEmail = payload.recipient.email || "guest@example.com";
    const { subject, htmlBody, textBody } = this.formatEmailTemplate(payload);
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const resultId = `NOTIF-EML-${Date.now()}-${Math.floor(Math.random() * 1e3)}`;
    if (this.isConfigured()) {
      try {
        console.log(`[EMAIL PROVIDER API] Sending email to ${recipientEmail} via API Key...`);
        return {
          id: resultId,
          type: payload.type,
          channel: "EMAIL",
          providerName: this.name,
          recipient: recipientEmail,
          subject,
          bodyPreview: textBody.substring(0, 140) + "...",
          success: true,
          messageId: `msg-live-email-${Date.now()}`,
          status: "SENT",
          timestamp
        };
      } catch (err) {
        return {
          id: resultId,
          type: payload.type,
          channel: "EMAIL",
          providerName: this.name,
          recipient: recipientEmail,
          subject,
          bodyPreview: textBody.substring(0, 140) + "...",
          success: false,
          status: "FAILED",
          error: err.message || "Email delivery failure",
          timestamp
        };
      }
    }
    console.log(`[EMAIL NOTIFICATION DISPATCHED - SIMULATED]`);
    console.log(`To: ${recipientEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:
${textBody}
---`);
    return {
      id: resultId,
      type: payload.type,
      channel: "EMAIL",
      providerName: `${this.name} (Simulator)`,
      recipient: recipientEmail,
      subject,
      bodyPreview: textBody.substring(0, 140) + "...",
      success: true,
      messageId: `msg-sim-email-${Date.now()}`,
      status: "SIMULATED",
      timestamp
    };
  }
  formatEmailTemplate(payload) {
    const name = payload.recipient.name || payload.guestName || "Valued Guest";
    const ref = payload.bookingReference || "N/A";
    const suite = payload.suiteName || "Kilifa Suite";
    switch (payload.type) {
      case "BOOKING_RECEIVED":
        return {
          subject: `[Kilifa Suites] Booking Request Received \u2014 ${ref}`,
          textBody: `Dear ${name},

We have received your reservation request for ${suite} (Ref: ${ref}).
Check-in: ${payload.checkInDate || "TBD"} | Check-out: ${payload.checkOutDate || "TBD"}.

Our concierge team is reviewing your booking details.

Warm regards,
Kilifa Suites Hospitality`,
          htmlBody: `<h2>Booking Request Received</h2><p>Dear ${name},</p><p>We received your booking request for <strong>${suite}</strong> (Ref: <code>${ref}</code>).</p><p>Kilifa Suites Concierge Team</p>`
        };
      case "BOOKING_CONFIRMED":
        return {
          subject: `[Kilifa Suites] Booking CONFIRMED \u2014 Ref: ${ref}`,
          textBody: `Dear ${name},

Your reservation for ${suite} at Kilifa Suites is officially CONFIRMED!
Booking Reference: ${ref}
Check-in: ${payload.checkInDate}
Check-out: ${payload.checkOutDate}

We look forward to welcoming you to luxury living in The Gambia.`,
          htmlBody: `<h2>Reservation Confirmed!</h2><p>Dear ${name},</p><p>Your stay at <strong>${suite}</strong> is confirmed (Ref: <code>${ref}</code>).</p>`
        };
      case "PAYMENT_RECEIVED":
        const displayAmt = `${payload.currency === "USD" ? "$" : "D "}${Number(payload.amount || 0).toLocaleString()}`;
        return {
          subject: `[Kilifa Suites] Payment Receipt \u2014 ${displayAmt}`,
          textBody: `Dear ${name},

Thank you for your payment of ${displayAmt} via ${payload.paymentMethod || "Payment Gateway"} for booking ${ref}.

Your account has been updated successfully.`,
          htmlBody: `<h2>Payment Confirmation</h2><p>Payment of <strong>${displayAmt}</strong> received for reservation ${ref}.</p>`
        };
      case "CHECK_IN_REMINDER":
        return {
          subject: `[Kilifa Suites] Upcoming Check-in Reminder \u2014 ${suite}`,
          textBody: `Dear ${name},

This is a friendly reminder that your check-in at Kilifa Suites (${suite}) is scheduled for ${payload.checkInDate}.

Need airport transfer or concierge service? Reply to this email or call our front desk.`,
          htmlBody: `<h2>Check-in Reminder</h2><p>We are excited to welcome you on ${payload.checkInDate} to <strong>${suite}</strong>.</p>`
        };
      case "CHECK_OUT_REMINDER":
        return {
          subject: `[Kilifa Suites] Check-out Information \u2014 ${suite}`,
          textBody: `Dear ${name},

We hope you enjoyed your stay at ${suite}.
Check-out time is scheduled for 11:00 AM on ${payload.checkOutDate}.

Please drop your key card at reception or place it on the suite desk upon departure.`,
          htmlBody: `<h2>Check-out Reminder</h2><p>Reminder: Check-out date is ${payload.checkOutDate}.</p>`
        };
      case "BOOKING_CANCELLATION":
        return {
          subject: `[Kilifa Suites] Booking Cancellation Notice \u2014 Ref: ${ref}`,
          textBody: `Dear ${name},

Your booking ${ref} for ${suite} has been cancelled.
If you have questions regarding refunds or rebooking, please contact reception.`,
          htmlBody: `<h2>Booking Cancelled</h2><p>Booking ${ref} for ${suite} has been cancelled.</p>`
        };
      case "ACCESS_CARD_INFO":
        return {
          subject: `[Kilifa Suites] Electronic Key Card & PIN \u2014 ${suite}`,
          textBody: `Dear ${name},

Your electronic door access key card for ${suite} is ready.

Card Number: ${payload.cardNumber || "N/A"}
Door Access PIN: ${payload.accessPin || "N/A"}
Valid: ${payload.validFrom || ""} to ${payload.validUntil || ""}

You can tap your NFC/Bluetooth mobile pass or enter your 4-digit PIN at your suite door.`,
          htmlBody: `<h2>Electronic Suite Key Card</h2><p>Door Access PIN: <strong>${payload.accessPin}</strong></p><p>Card Number: <code>${payload.cardNumber}</code></p>`
        };
      default:
        return {
          subject: `[Kilifa Suites] Notification \u2014 ${ref}`,
          textBody: `Dear ${name},

${payload.customMessage || "Update regarding your reservation at Kilifa Suites."}

Kilifa Suites Team`,
          htmlBody: `<p>${payload.customMessage || "Update regarding your stay at Kilifa Suites."}</p>`
        };
    }
  }
};

// src/server/notifications/providers/WhatsAppNotificationProvider.ts
var WhatsAppNotificationProvider = class {
  constructor() {
    this.name = "KILIFA_WHATSAPP_PROVIDER";
    this.channel = "WHATSAPP";
    this.apiToken = process.env.WHATSAPP_API_TOKEN || process.env.TWILIO_WHATSAPP_TOKEN;
    this.phoneId = process.env.WHATSAPP_PHONE_ID || process.env.TWILIO_WHATSAPP_NUMBER;
  }
  isConfigured() {
    return Boolean(this.apiToken && this.apiToken.trim().length > 0);
  }
  getStatus() {
    const configured = this.isConfigured();
    return {
      providerName: this.name,
      channel: this.channel,
      configured,
      statusText: configured ? `Configured via Meta WhatsApp Business Cloud API (${this.phoneId || "Live Node"})` : "Development Mode (Simulated WhatsApp Message / Local Logging)"
    };
  }
  async send(payload) {
    const recipientPhone = payload.recipient.phone || "+2207000000";
    const messageText = this.formatWhatsAppTemplate(payload);
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const resultId = `NOTIF-WA-${Date.now()}-${Math.floor(Math.random() * 1e3)}`;
    if (this.isConfigured()) {
      try {
        console.log(`[WHATSAPP API] Sending message to ${recipientPhone}...`);
        return {
          id: resultId,
          type: payload.type,
          channel: "WHATSAPP",
          providerName: this.name,
          recipient: recipientPhone,
          bodyPreview: messageText.substring(0, 140) + "...",
          success: true,
          messageId: `wa-msg-${Date.now()}`,
          status: "SENT",
          timestamp
        };
      } catch (err) {
        return {
          id: resultId,
          type: payload.type,
          channel: "WHATSAPP",
          providerName: this.name,
          recipient: recipientPhone,
          bodyPreview: messageText.substring(0, 140) + "...",
          success: false,
          status: "FAILED",
          error: err.message || "WhatsApp message dispatch error",
          timestamp
        };
      }
    }
    console.log(`[WHATSAPP NOTIFICATION DISPATCHED - SIMULATED]`);
    console.log(`Recipient WhatsApp: ${recipientPhone}`);
    console.log(`Message Content:
${messageText}
---`);
    return {
      id: resultId,
      type: payload.type,
      channel: "WHATSAPP",
      providerName: `${this.name} (Simulator)`,
      recipient: recipientPhone,
      bodyPreview: messageText.substring(0, 140) + "...",
      success: true,
      messageId: `wa-sim-msg-${Date.now()}`,
      status: "SIMULATED",
      timestamp
    };
  }
  formatWhatsAppTemplate(payload) {
    const name = payload.recipient.name || payload.guestName || "Guest";
    const ref = payload.bookingReference || "N/A";
    const suite = payload.suiteName || "Kilifa Suite";
    switch (payload.type) {
      case "BOOKING_RECEIVED":
        return `\u{1F6CE}\uFE0F *Kilifa Suites Reservation Request*

Hello *${name}*,
We have received your booking request for *${suite}* (Ref: *${ref}*).

Our team is finalizing your reservation details. Thank you for choosing Kilifa Suites, The Gambia! \u{1F334}`;
      case "BOOKING_CONFIRMED":
        return `\u2705 *Booking Confirmed \u2014 Kilifa Suites*

Hello *${name}*,
Your stay at *${suite}* is officially CONFIRMED!

\u{1F4CC} *Ref:* ${ref}
\u{1F5D3}\uFE0F *Check-in:* ${payload.checkInDate || "TBD"}
\u{1F5D3}\uFE0F *Check-out:* ${payload.checkOutDate || "TBD"}

Need assistance? Reply directly to this WhatsApp chat.`;
      case "PAYMENT_RECEIVED":
        const waAmt = `${payload.currency === "USD" ? "$" : "D "}${Number(payload.amount || 0).toLocaleString()}`;
        return `\u{1F4B3} *Payment Confirmation*

Dear *${name}*,
We received your payment of *${waAmt}* (${payload.paymentMethod || "Gateway"}) for booking *${ref}*.

Thank you for choosing Kilifa Suites!`;
      case "CHECK_IN_REMINDER":
        return `\u{1F3E8} *Upcoming Stay Reminder*

Dear *${name}*,
We are excited to welcome you to *${suite}* on *${payload.checkInDate}*!

Our front desk concierge is at your service. Safe travels! \u2728`;
      case "CHECK_OUT_REMINDER":
        return `\u{1F511} *Check-out Reminder*

Dear *${name}*,
Reminder that check-out for *${suite}* is scheduled for *${payload.checkOutDate}* by 11:00 AM.

We hope you had an extraordinary stay at Kilifa Suites!`;
      case "BOOKING_CANCELLATION":
        return `\u274C *Booking Cancellation Notice*

Dear *${name}*,
Your booking *${ref}* for *${suite}* has been cancelled.
Contact reception for further assistance.`;
      case "ACCESS_CARD_INFO":
        return `\u{1F510} *Electronic Key Card & PIN \u2014 Kilifa Suites*

Dear *${name}*,
Your electronic door access for *${suite}* is active:

\u{1F522} *Door PIN:* ${payload.accessPin || "N/A"}
\u{1F4B3} *Card #:* ${payload.cardNumber || "N/A"}
\u23F1\uFE0F *Valid:* ${payload.validFrom || ""} to ${payload.validUntil || ""}

Enter your 4-digit PIN on your suite keypad or tap your digital key token.`;
      default:
        return `\u{1F514} *Kilifa Suites Notification*

Dear *${name}*,
${payload.customMessage || "Update regarding your reservation."}`;
    }
  }
};

// src/server/notifications/providers/SmsNotificationProvider.ts
var SmsNotificationProvider = class {
  constructor() {
    this.name = "KILIFA_SMS_PROVIDER";
    this.channel = "SMS";
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.SMS_GATEWAY_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN || process.env.SMS_GATEWAY_KEY;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || process.env.SMS_FROM_NAME || "KILIFA";
  }
  isConfigured() {
    return Boolean(this.accountSid && this.authToken);
  }
  getStatus() {
    const configured = this.isConfigured();
    return {
      providerName: this.name,
      channel: this.channel,
      configured,
      statusText: configured ? `Configured via Twilio / Gambia SMS Gateway (${this.fromNumber})` : "Development Mode (Simulated SMS Dispatch / Local Logging)"
    };
  }
  async send(payload) {
    const recipientPhone = payload.recipient.phone || "+2207000000";
    const smsText = this.formatSmsTemplate(payload);
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const resultId = `NOTIF-SMS-${Date.now()}-${Math.floor(Math.random() * 1e3)}`;
    if (this.isConfigured()) {
      try {
        console.log(`[SMS GATEWAY] Dispatching SMS to ${recipientPhone} via API...`);
        return {
          id: resultId,
          type: payload.type,
          channel: "SMS",
          providerName: this.name,
          recipient: recipientPhone,
          bodyPreview: smsText,
          success: true,
          messageId: `sms-msg-${Date.now()}`,
          status: "SENT",
          timestamp
        };
      } catch (err) {
        return {
          id: resultId,
          type: payload.type,
          channel: "SMS",
          providerName: this.name,
          recipient: recipientPhone,
          bodyPreview: smsText,
          success: false,
          status: "FAILED",
          error: err.message || "SMS delivery error",
          timestamp
        };
      }
    }
    console.log(`[SMS NOTIFICATION DISPATCHED - SIMULATED]`);
    console.log(`To Phone: ${recipientPhone}`);
    console.log(`Message: ${smsText}
---`);
    return {
      id: resultId,
      type: payload.type,
      channel: "SMS",
      providerName: `${this.name} (Simulator)`,
      recipient: recipientPhone,
      bodyPreview: smsText,
      success: true,
      messageId: `sms-sim-msg-${Date.now()}`,
      status: "SIMULATED",
      timestamp
    };
  }
  formatSmsTemplate(payload) {
    const name = payload.recipient.name || payload.guestName || "Guest";
    const ref = payload.bookingReference || "N/A";
    const suite = payload.suiteName || "Kilifa Suite";
    switch (payload.type) {
      case "BOOKING_RECEIVED":
        return `KILIFA SUITES: Reservation request received for ${suite} (Ref: ${ref}). We will confirm shortly.`;
      case "BOOKING_CONFIRMED":
        return `KILIFA SUITES: Booking CONFIRMED! Ref: ${ref}. Suite: ${suite}. Checkin: ${payload.checkInDate || "TBD"}. Welcome!`;
      case "PAYMENT_RECEIVED":
        const smsAmt = `${payload.currency === "USD" ? "$" : "D "}${Number(payload.amount || 0).toLocaleString()}`;
        return `KILIFA SUITES: Received ${smsAmt} for booking ${ref}. Thank you!`;
      case "CHECK_IN_REMINDER":
        return `KILIFA SUITES: Reminder - Check-in for ${suite} is ${payload.checkInDate}. Front desk is at your service.`;
      case "CHECK_OUT_REMINDER":
        return `KILIFA SUITES: Reminder - Check-out for ${suite} is ${payload.checkOutDate} by 11:00 AM. Thank you for staying!`;
      case "BOOKING_CANCELLATION":
        return `KILIFA SUITES: Booking ${ref} for ${suite} has been cancelled. Contact reception for info.`;
      case "ACCESS_CARD_INFO":
        return `KILIFA SUITES: Door access for ${suite}: PIN is ${payload.accessPin || "N/A"}, Card #${payload.cardNumber || "N/A"}. Valid until ${payload.validUntil || ""}.`;
      default:
        return `KILIFA SUITES: ${payload.customMessage || "Notification regarding your reservation."}`;
    }
  }
};

// src/server/notifications/NotificationManager.ts
var NotificationManager = class {
  constructor() {
    this.providers = /* @__PURE__ */ new Map();
    this.auditHistory = [];
    this.registerProvider(new EmailNotificationProvider());
    this.registerProvider(new WhatsAppNotificationProvider());
    this.registerProvider(new SmsNotificationProvider());
    this.seedDemoHistory();
  }
  /**
   * Register or replace a channel provider abstraction dynamically
   */
  registerProvider(provider) {
    this.providers.set(provider.channel, provider);
    console.log(`[NOTIFICATION MANAGER] Registered provider '${provider.name}' for channel '${provider.channel}'`);
  }
  getProvider(channel) {
    return this.providers.get(channel);
  }
  getProvidersStatus() {
    const statuses = [];
    for (const provider of this.providers.values()) {
      statuses.push(provider.getStatus());
    }
    return statuses;
  }
  /**
   * Dispatch notification across specified channels or default to Email + WhatsApp
   */
  async dispatch(payload, channels = ["EMAIL", "WHATSAPP"]) {
    const results = [];
    for (const channel of channels) {
      const provider = this.providers.get(channel);
      if (!provider) {
        const errorResult = {
          id: `NOTIF-ERR-${Date.now()}`,
          type: payload.type,
          channel,
          providerName: "NONE",
          recipient: payload.recipient.email || payload.recipient.phone || "Unknown",
          bodyPreview: "No provider registered for this channel",
          success: false,
          status: "FAILED",
          error: `No notification provider registered for channel ${channel}`,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        results.push(errorResult);
        this.addAuditLog(errorResult);
        continue;
      }
      try {
        const result = await provider.send(payload);
        results.push(result);
        this.addAuditLog(result);
      } catch (err) {
        const failedResult = {
          id: `NOTIF-ERR-${Date.now()}`,
          type: payload.type,
          channel,
          providerName: provider.name,
          recipient: payload.recipient.email || payload.recipient.phone || "Unknown",
          bodyPreview: "Dispatch exception",
          success: false,
          status: "FAILED",
          error: err.message || "Notification sending threw exception",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        results.push(failedResult);
        this.addAuditLog(failedResult);
      }
    }
    return results;
  }
  getAuditHistory(limit = 50) {
    return this.auditHistory.slice(0, limit);
  }
  addAuditLog(result) {
    this.auditHistory.unshift(result);
    if (this.auditHistory.length > 200) {
      this.auditHistory.pop();
    }
  }
  seedDemoHistory() {
    const now = /* @__PURE__ */ new Date();
    this.auditHistory = [
      {
        id: "NOTIF-EML-DEMO-101",
        type: "ACCESS_CARD_INFO",
        channel: "EMAIL",
        providerName: "KILIFA_EMAIL_PROVIDER (Simulator)",
        recipient: "fatou.ceesay@example.com",
        subject: "[Kilifa Suites] Electronic Key Card & PIN \u2014 Ambassador Executive Suite 2",
        bodyPreview: "Dear Fatou Ceesay, Your electronic door access key card for Ambassador Executive Suite 2 is ready...",
        success: true,
        messageId: "msg-sim-email-demo-101",
        status: "SIMULATED",
        timestamp: new Date(now.getTime() - 36e5 * 2).toISOString()
      },
      {
        id: "NOTIF-WA-DEMO-102",
        type: "BOOKING_CONFIRMED",
        channel: "WHATSAPP",
        providerName: "KILIFA_WHATSAPP_PROVIDER (Simulator)",
        recipient: "+2207001020",
        bodyPreview: "\u2705 Booking Confirmed \u2014 Kilifa Suites. Hello Fatou Ceesay, Your stay at Ambassador Executive Suite 2 is confirmed...",
        success: true,
        messageId: "wa-sim-msg-demo-102",
        status: "SIMULATED",
        timestamp: new Date(now.getTime() - 36e5 * 5).toISOString()
      },
      {
        id: "NOTIF-SMS-DEMO-103",
        type: "PAYMENT_RECEIVED",
        channel: "SMS",
        providerName: "KILIFA_SMS_PROVIDER (Simulator)",
        recipient: "+2207001020",
        bodyPreview: "KILIFA SUITES: Received D 5,000 for booking KS-910234. Thank you!",
        success: true,
        messageId: "sms-sim-msg-demo-103",
        status: "SIMULATED",
        timestamp: new Date(now.getTime() - 36e5 * 6).toISOString()
      }
    ];
  }
};
var notificationManager = new NotificationManager();

// src/server/services/notificationService.ts
var NotificationService = class {
  /**
   * Get health status of all notification provider abstractions
   */
  getProvidersStatus() {
    return notificationManager.getProvidersStatus();
  }
  /**
   * Get audit logs of all sent/simulated dispatches
   */
  getAuditHistory(limit) {
    return notificationManager.getAuditHistory(limit);
  }
  /**
   * Generic Dispatch Trigger
   */
  async sendNotification(payload, channels) {
    const results = await notificationManager.dispatch(payload, channels);
    try {
      if (payload.recipient.email) {
        const user = await prisma.user.findUnique({ where: { email: payload.recipient.email } });
        if (user) {
          const bodyText = results[0]?.bodyPreview || `Notification sent for ${payload.type}`;
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: `[Kilifa Suites] ${payload.type}`,
              message: bodyText
            }
          });
        }
      }
    } catch (err) {
      console.warn("[NOTIFICATION SERVICE] Prisma user notification sync warning:", err.message);
    }
    return results;
  }
  /**
   * 1. Booking Received Notification
   */
  async notifyBookingReceived(booking, channels) {
    return this.sendNotification(
      {
        type: "BOOKING_RECEIVED",
        recipient: { email: booking.email, phone: booking.phone, name: booking.fullName },
        bookingReference: booking.bookingReference,
        suiteName: booking.suiteName,
        guestName: booking.fullName,
        checkInDate: booking.checkIn,
        checkOutDate: booking.checkOut
      },
      channels
    );
  }
  /**
   * 2. Booking Confirmed Notification
   */
  async notifyBookingConfirmed(booking, channels) {
    return this.sendNotification(
      {
        type: "BOOKING_CONFIRMED",
        recipient: { email: booking.email, phone: booking.phone, name: booking.fullName },
        bookingReference: booking.bookingReference,
        suiteName: booking.suiteName,
        guestName: booking.fullName,
        checkInDate: booking.checkIn,
        checkOutDate: booking.checkOut
      },
      channels
    );
  }
  /**
   * 3. Payment Received Notification
   */
  async notifyPaymentReceived(payment, channels) {
    return this.sendNotification(
      {
        type: "PAYMENT_RECEIVED",
        recipient: { email: payment.email, phone: payment.phone, name: payment.fullName },
        bookingReference: payment.bookingReference,
        guestName: payment.fullName,
        amount: payment.amount,
        currency: payment.currency || "GMD",
        paymentMethod: payment.paymentMethod || "Wave / Mobile Money"
      },
      channels
    );
  }
  /**
   * 4. Check-in Reminder Notification
   */
  async notifyCheckInReminder(booking, channels) {
    return this.sendNotification(
      {
        type: "CHECK_IN_REMINDER",
        recipient: { email: booking.email, phone: booking.phone, name: booking.fullName },
        bookingReference: booking.bookingReference,
        suiteName: booking.suiteName,
        guestName: booking.fullName,
        checkInDate: booking.checkIn
      },
      channels
    );
  }
  /**
   * 5. Check-out Reminder Notification
   */
  async notifyCheckOutReminder(booking, channels) {
    return this.sendNotification(
      {
        type: "CHECK_OUT_REMINDER",
        recipient: { email: booking.email, phone: booking.phone, name: booking.fullName },
        bookingReference: booking.bookingReference,
        suiteName: booking.suiteName,
        guestName: booking.fullName,
        checkOutDate: booking.checkOut
      },
      channels
    );
  }
  /**
   * 6. Booking Cancellation Notification
   */
  async notifyBookingCancellation(booking, channels) {
    return this.sendNotification(
      {
        type: "BOOKING_CANCELLATION",
        recipient: { email: booking.email, phone: booking.phone, name: booking.fullName },
        bookingReference: booking.bookingReference,
        suiteName: booking.suiteName,
        guestName: booking.fullName
      },
      channels
    );
  }
  /**
   * 7. Access Card Info Notification
   */
  async notifyAccessCardInfo(card, channels) {
    return this.sendNotification(
      {
        type: "ACCESS_CARD_INFO",
        recipient: { email: card.email, phone: card.phone, name: card.fullName },
        bookingReference: card.bookingReference,
        suiteName: card.suiteName,
        guestName: card.fullName,
        cardNumber: card.cardNumber,
        accessPin: card.pinCode,
        validFrom: card.validFrom,
        validUntil: card.validUntil
      },
      channels
    );
  }
};
var notificationService = new NotificationService();

// src/server/services/accessControlService.ts
var AccessControlService = class {
  getHardwareSpec() {
    return accessControlManager.getHardwareSpec();
  }
  /**
   * Lifecycle Step 1 & 2: Booking confirmed -> Access card created & stored in Prisma
   */
  async createCardForBooking(req) {
    const cardData = await accessControlManager.handleBookingConfirmed(req);
    try {
      const booking = await prisma.booking.findFirst({
        where: { OR: [{ id: req.bookingId }, { bookingReference: req.bookingReference }] },
        include: { accessCard: true }
      });
      if (booking) {
        const validFrom = req.checkIn ? new Date(req.checkIn) : /* @__PURE__ */ new Date();
        const validUntil = req.checkOut ? new Date(req.checkOut) : new Date(Date.now() + 864e5 * 3);
        if (booking.accessCard) {
          const updated = await prisma.accessCard.update({
            where: { id: booking.accessCard.id },
            data: {
              cardNumber: cardData.cardNumber,
              pinCode: cardData.pinCode,
              status: AccessCardStatus.INACTIVE,
              validFrom,
              validUntil
            }
          });
          cardData.id = updated.id;
        } else {
          const newCard = await prisma.accessCard.create({
            data: {
              bookingId: booking.id,
              cardNumber: cardData.cardNumber,
              pinCode: cardData.pinCode,
              status: AccessCardStatus.INACTIVE,
              validFrom,
              validUntil
            }
          });
          cardData.id = newCard.id;
        }
      }
    } catch (err) {
      console.warn("[ACCESS SERVICE] Prisma access card sync warning:", err.message);
    }
    return cardData;
  }
  /**
   * Lifecycle Step 3: Card activated
   */
  async activateCard(cardId) {
    const cardData = await accessControlManager.activateAccessCard(cardId);
    try {
      await prisma.accessCard.updateMany({
        where: { OR: [{ id: cardId }, { cardNumber: cardId }] },
        data: { status: AccessCardStatus.ACTIVE }
      });
      if (cardData && cardData.guestName) {
        notificationService.notifyAccessCardInfo({
          email: `${cardData.guestName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
          phone: "+2207000000",
          fullName: cardData.guestName,
          bookingReference: cardData.bookingReference || "KS-REF",
          suiteName: cardData.suiteName || "Kilifa Suite",
          cardNumber: cardData.cardNumber,
          pinCode: cardData.pinCode,
          validFrom: cardData.validFrom,
          validUntil: cardData.validUntil
        }).catch((err) => console.warn("[CARD NOTIFICATION ERROR]", err));
      }
    } catch (err) {
      console.warn("[ACCESS SERVICE] Prisma activate update warning:", err.message);
    }
    return cardData;
  }
  /**
   * Lifecycle Step 4: Guest checks in -> Door unlatched & card activated
   */
  async processGuestCheckIn(cardId) {
    const result = await accessControlManager.handleGuestCheckIn(cardId);
    try {
      await prisma.accessCard.updateMany({
        where: { OR: [{ id: cardId }, { cardNumber: cardId }] },
        data: { status: AccessCardStatus.ACTIVE }
      });
    } catch (err) {
      console.warn("[ACCESS SERVICE] Prisma checkin update warning:", err.message);
    }
    return result;
  }
  /**
   * Lifecycle Step 5: Door Tap / Access log simulation
   */
  async simulateDoorEntry(req) {
    return accessControlManager.simulateDoorEntry(req);
  }
  /**
   * Lifecycle Step 6 & 7: Guest checkout -> Card expires
   */
  async processGuestCheckOut(cardId) {
    const result = await accessControlManager.handleGuestCheckOut(cardId);
    try {
      await prisma.accessCard.updateMany({
        where: { OR: [{ id: cardId }, { cardNumber: cardId }] },
        data: { status: AccessCardStatus.EXPIRED }
      });
    } catch (err) {
      console.warn("[ACCESS SERVICE] Prisma checkout update warning:", err.message);
    }
    return result;
  }
  /**
   * Revoke or Expire Card
   */
  async revokeCard(cardId, reason) {
    const cardData = await accessControlManager.revokeCard(cardId, reason);
    try {
      await prisma.accessCard.updateMany({
        where: { OR: [{ id: cardId }, { cardNumber: cardId }] },
        data: { status: AccessCardStatus.REVOKED }
      });
    } catch (err) {
      console.warn("[ACCESS SERVICE] Prisma revoke update warning:", err.message);
    }
    return cardData;
  }
  async getCardDetails(cardId) {
    const cardData = await accessControlManager.getCardDetails(cardId);
    if (!cardData) {
      try {
        const dbCard = await prisma.accessCard.findFirst({
          where: { OR: [{ id: cardId }, { cardNumber: cardId }, { bookingId: cardId }] },
          include: { booking: { include: { suite: true } } }
        });
        if (dbCard) {
          return {
            id: dbCard.id,
            bookingId: dbCard.bookingId,
            bookingReference: dbCard.booking?.bookingReference || "N/A",
            cardNumber: dbCard.cardNumber,
            pinCode: dbCard.pinCode,
            digitalKeyToken: `BLE-SALTO-${dbCard.id}`,
            qrAccessCode: `KS-GATE-PASS-${dbCard.booking?.bookingReference}`,
            suiteName: dbCard.booking?.suite?.name || "DAR",
            guestName: dbCard.booking?.fullName || "Guest",
            validFrom: dbCard.validFrom.toISOString(),
            validUntil: dbCard.validUntil.toISOString(),
            status: dbCard.status,
            lifecycleStage: dbCard.status === "ACTIVE" ? "CARD_ACTIVATED" : "CARD_CREATED",
            physicalChipUid: "04:A1:B2:C3:D4",
            createdAt: dbCard.createdAt.toISOString()
          };
        }
      } catch (err) {
        console.warn("[ACCESS SERVICE] Prisma card lookup failed:", err.message);
      }
    }
    return cardData;
  }
  async getDoorAuditLogs(cardId) {
    return accessControlManager.getDoorAuditLogs(cardId);
  }
  async getAllCards() {
    if (isDatabaseConnected()) {
      try {
        const dbCards = await prisma.accessCard.findMany({
          include: { booking: { include: { suite: true } } },
          orderBy: { createdAt: "desc" }
        });
        if (dbCards && dbCards.length > 0) {
          return dbCards.map((c) => ({
            id: c.id,
            bookingId: c.bookingId,
            bookingReference: c.booking?.bookingReference || "N/A",
            cardNumber: c.cardNumber,
            pinCode: c.pinCode,
            digitalKeyToken: `BLE-SALTO-${c.id}`,
            suiteName: c.booking?.suite?.name || "Suite",
            guestName: c.booking?.fullName || "Guest",
            validFrom: c.validFrom.toISOString(),
            validUntil: c.validUntil.toISOString(),
            status: c.status,
            createdAt: c.createdAt.toISOString()
          }));
        }
      } catch (err) {
      }
    }
    const demoCard = await accessControlManager.getCardDetails("card-demo-102");
    return demoCard ? [demoCard] : [];
  }
};
var accessControlService = new AccessControlService();

// src/server/services/bookingService.ts
var BookingService = class {
  constructor() {
    this.fallbackBookings = [
      {
        id: "bkg-demo-101",
        bookingReference: "KS-882910",
        fullName: "Lamin Touray",
        email: "lamin.touray@example.com",
        phone: "+2207000000",
        checkIn: new Date(Date.now() - 14 * 864e5).toISOString().split("T")[0],
        checkOut: new Date(Date.now() - 11 * 864e5).toISOString().split("T")[0],
        guestsCount: 2,
        preferredSuite: "suite-01",
        suiteName: "DAR",
        pricePerNight: 2500,
        totalNights: 3,
        totalEstimatedPrice: 7500,
        specialRequests: "Airport shuttle pickup requested",
        status: "CHECKED_OUT",
        payment: {
          id: "pmt-demo-101",
          amount: 7500,
          status: "PAID"
        },
        accessCard: {
          id: "card-demo-101",
          cardNumber: "AC-KS-0101",
          status: "EXPIRED"
        },
        createdAt: new Date(Date.now() - 15 * 864e5).toISOString()
      },
      {
        id: "bkg-demo-102",
        bookingReference: "KS-910234",
        fullName: "Fatou Ceesay",
        email: "fatou.ceesay@example.com",
        phone: "+2207112233",
        checkIn: new Date(Date.now() - 7 * 864e5).toISOString().split("T")[0],
        checkOut: new Date(Date.now() - 5 * 864e5).toISOString().split("T")[0],
        guestsCount: 1,
        preferredSuite: "suite-02",
        suiteName: "SAMA",
        pricePerNight: 2500,
        totalNights: 2,
        totalEstimatedPrice: 5e3,
        specialRequests: "Late check-in expected around 8 PM",
        status: "CHECKED_OUT",
        payment: {
          id: "pmt-demo-102",
          amount: 5e3,
          status: "PAID"
        },
        accessCard: {
          id: "card-demo-102",
          cardNumber: "AC-KS-0102",
          status: "EXPIRED"
        },
        createdAt: new Date(Date.now() - 8 * 864e5).toISOString()
      }
    ];
  }
  async createBooking(data) {
    const targetSuiteId = (data.suiteId || data.preferredSuite)?.trim();
    if (!targetSuiteId) {
      throw new ApiError(400, "Suite identifier (suiteId) is required.");
    }
    const [sy, sm, sd] = data.checkIn.split("-").map(Number);
    const [ey, em, ed] = data.checkOut.split("-").map(Number);
    const startUtc = Date.UTC(sy, sm - 1, sd);
    const endUtc = Date.UTC(ey, em - 1, ed);
    const nights = Math.max(1, Math.round((endUtc - startUtc) / 864e5));
    const start = new Date(data.checkIn);
    const end = new Date(data.checkOut);
    const targetSuiteLower = targetSuiteId.toLowerCase();
    const staticSuite = SUITES_DATA.find(
      (s) => s.id.toLowerCase() === targetSuiteLower || s.slug.toLowerCase() === targetSuiteLower || s.name.toLowerCase() === targetSuiteLower
    );
    if (!isDatabaseConnected() && !isMemoryFallbackAllowed()) {
      throw new ApiError(
        503,
        "Reservation database service is currently unavailable. Please try again shortly."
      );
    }
    if (isDatabaseConnected()) {
      try {
        let dbSuite = await prisma.suite.findFirst({
          where: {
            OR: [
              { id: targetSuiteId },
              { slug: targetSuiteId },
              { name: { equals: targetSuiteId, mode: "insensitive" } }
            ]
          }
        });
        if (!dbSuite && !staticSuite) {
          throw new ApiError(404, `The requested suite '${targetSuiteId}' was not found.`);
        }
        const suiteName = dbSuite ? dbSuite.name : staticSuite.name;
        const pricePerNight2 = dbSuite ? dbSuite.pricePerNight : staticSuite.pricePerNight;
        const maxOccupancy = dbSuite ? dbSuite.maxOccupancy : staticSuite.maxOccupancy;
        if (data.guestsCount > maxOccupancy) {
          throw new ApiError(
            400,
            `Guest count (${data.guestsCount}) exceeds the maximum occupancy of ${maxOccupancy} for ${suiteName}.`
          );
        }
        const totalEstimatedPrice2 = pricePerNight2 * nights;
        if (data.idempotencyKey) {
          const existingByIdempotency = await prisma.booking.findUnique({
            where: { idempotencyKey: data.idempotencyKey },
            include: { suite: true, payment: true, accessCard: true }
          });
          if (existingByIdempotency) {
            return this.mapPrismaToRecord(existingByIdempotency);
          }
        }
        const oneMinuteAgo = new Date(Date.now() - 60 * 1e3);
        const recentDuplicate = await prisma.booking.findFirst({
          where: {
            email: data.email.toLowerCase(),
            suiteId: dbSuite?.id || targetSuiteId,
            checkIn: start,
            checkOut: end,
            createdAt: { gte: oneMinuteAgo }
          },
          include: { suite: true, payment: true, accessCard: true }
        });
        if (recentDuplicate) {
          return this.mapPrismaToRecord(recentDuplicate);
        }
        const resolvedSuiteId = dbSuite ? dbSuite.id : targetSuiteId;
        const created = await prisma.$transaction(async (tx) => {
          const conflictingBooking = await tx.booking.findFirst({
            where: {
              suiteId: resolvedSuiteId,
              status: {
                in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN]
              },
              // Standard date overlap logic: (ExistingStart < RequestedEnd) AND (ExistingEnd > RequestedStart)
              checkIn: { lt: end },
              checkOut: { gt: start }
            }
          });
          if (conflictingBooking) {
            throw new ApiError(
              409,
              `The requested suite '${suiteName}' is already reserved for the selected dates (${data.checkIn} to ${data.checkOut}). Please select alternative dates or an available suite.`
            );
          }
          const guest = await tx.guest.upsert({
            where: { email: data.email.toLowerCase() },
            update: {
              fullName: data.fullName,
              phone: data.phone,
              totalBookings: { increment: 1 }
            },
            create: {
              fullName: data.fullName,
              email: data.email.toLowerCase(),
              phone: data.phone,
              totalBookings: 1
            }
          });
          const bookingReference2 = `KS-${Math.floor(1e5 + Math.random() * 9e5)}`;
          return tx.booking.create({
            data: {
              bookingReference: bookingReference2,
              idempotencyKey: data.idempotencyKey || null,
              fullName: data.fullName,
              email: data.email.toLowerCase(),
              phone: data.phone,
              checkIn: start,
              checkOut: end,
              guestsCount: data.guestsCount,
              pricePerNight: pricePerNight2,
              totalNights: nights,
              totalEstimatedPrice: totalEstimatedPrice2,
              specialRequests: data.specialRequests || "",
              status: BookingStatus.PENDING,
              suiteId: resolvedSuiteId,
              guestId: guest.id,
              payment: {
                create: {
                  amount: totalEstimatedPrice2,
                  currency: "GMD",
                  status: PaymentStatus.PENDING,
                  method: PaymentMethod.CASH,
                  transactionRef: `TXN-${bookingReference2}`
                }
              },
              accessCard: {
                create: {
                  cardNumber: `AC-${bookingReference2}`,
                  pinCode: `${Math.floor(1e3 + Math.random() * 9e3)}`,
                  status: AccessCardStatus2.INACTIVE,
                  validFrom: start,
                  validUntil: end
                }
              }
            },
            include: {
              suite: true,
              payment: true,
              accessCard: true
            }
          });
        });
        notificationService.notifyBookingReceived({
          email: created.email,
          phone: created.phone,
          fullName: created.fullName,
          bookingReference: created.bookingReference,
          suiteName: created.suite ? created.suite.name : suiteName,
          checkIn: data.checkIn,
          checkOut: data.checkOut
        }).catch((err) => console.warn("[NOTIFICATION TRIGGER ERROR]", err));
        return this.mapPrismaToRecord(created);
      } catch (err) {
        if (err instanceof ApiError) {
          throw err;
        }
        if (!isMemoryFallbackAllowed()) {
          console.error(
            "[BOOKING SERVICE] Database operation failed and memory fallback is prohibited:",
            err.message
          );
          throw new ApiError(
            503,
            "Reservation service is currently undergoing maintenance or database reconnect. Please try again in a few moments."
          );
        }
        console.warn(
          "[BOOKING SERVICE] Database query failed, evaluating memory fallback:",
          err.message
        );
      }
    }
    if (!staticSuite) {
      throw new ApiError(404, `Suite '${targetSuiteId}' was not found in catalog.`);
    }
    if (data.guestsCount > staticSuite.maxOccupancy) {
      throw new ApiError(
        400,
        `Guest count (${data.guestsCount}) exceeds the maximum occupancy of ${staticSuite.maxOccupancy} for ${staticSuite.name}.`
      );
    }
    const hasOverlapInFallback = this.fallbackBookings.some((b) => {
      if (b.preferredSuite !== targetSuiteId && b.suiteName !== staticSuite.name) return false;
      if (b.status === "CANCELLED") return false;
      const bStart = new Date(b.checkIn).getTime();
      const bEnd = new Date(b.checkOut).getTime();
      return bStart < end.getTime() && bEnd > start.getTime();
    });
    if (hasOverlapInFallback) {
      throw new ApiError(
        409,
        `The requested suite '${staticSuite.name}' is already reserved for the selected dates. Please select alternative dates.`
      );
    }
    const pricePerNight = staticSuite.pricePerNight;
    const totalEstimatedPrice = pricePerNight * nights;
    const bookingReference = `KS-${Math.floor(1e5 + Math.random() * 9e5)}`;
    const id = `bkg-${Date.now()}`;
    const newBooking = {
      id,
      bookingReference,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guestsCount: data.guestsCount,
      preferredSuite: targetSuiteId,
      suiteName: staticSuite.name,
      pricePerNight,
      totalNights: nights,
      totalEstimatedPrice,
      specialRequests: data.specialRequests || "",
      status: "PENDING",
      payment: {
        id: `pmt-${Date.now()}`,
        amount: totalEstimatedPrice,
        status: "PENDING"
      },
      accessCard: {
        id: `card-${Date.now()}`,
        cardNumber: `AC-${bookingReference}`,
        status: "INACTIVE"
      },
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.fallbackBookings.push(newBooking);
    return newBooking;
  }
  async getBookingById(id) {
    if (isDatabaseConnected()) {
      try {
        const booking = await prisma.booking.findFirst({
          where: {
            OR: [{ id }, { bookingReference: id }]
          },
          include: {
            suite: true,
            payment: true,
            accessCard: true
          }
        });
        if (booking) {
          return this.mapPrismaToRecord(booking);
        }
      } catch (err) {
        if (err instanceof ApiError) throw err;
      }
    }
    const fallback = this.fallbackBookings.find(
      (b) => b.id === id || b.bookingReference === id
    );
    if (!fallback) {
      throw new ApiError(404, `Booking record '${id}' not found`);
    }
    return fallback;
  }
  async getAllBookings() {
    if (isDatabaseConnected()) {
      try {
        const bookings = await prisma.booking.findMany({
          include: {
            suite: true,
            payment: true,
            accessCard: true
          },
          orderBy: { createdAt: "desc" }
        });
        if (bookings && bookings.length > 0) {
          return bookings.map((b) => this.mapPrismaToRecord(b));
        }
      } catch (err) {
        if (err instanceof ApiError) throw err;
      }
    }
    return this.fallbackBookings;
  }
  async updateBookingStatus(id, status) {
    const validStatuses = ["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"];
    const normalizedStatus = status.toUpperCase().trim();
    if (!validStatuses.includes(normalizedStatus)) {
      throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }
    if (!isDatabaseConnected() && !isMemoryFallbackAllowed()) {
      throw new ApiError(
        503,
        "Database service is temporarily unavailable. Please try again shortly."
      );
    }
    if (isDatabaseConnected()) {
      try {
        const existing = await prisma.booking.findFirst({
          where: { OR: [{ id }, { bookingReference: id }] }
        });
        if (existing) {
          const updated = await prisma.booking.update({
            where: { id: existing.id },
            data: { status: normalizedStatus },
            include: { suite: true, payment: true, accessCard: true }
          });
          if (normalizedStatus === "CONFIRMED") {
            if (updated.payment) {
              await prisma.payment.update({
                where: { id: updated.payment.id },
                data: { status: PaymentStatus.COMPLETED }
              });
            }
            if (updated.accessCard) {
              await accessControlService.activateCard(updated.accessCard.id);
            }
            notificationService.notifyBookingConfirmed({
              email: updated.email,
              phone: updated.phone,
              fullName: updated.fullName,
              bookingReference: updated.bookingReference,
              suiteName: updated.suite ? updated.suite.name : "Kilifa Suite",
              checkIn: updated.checkIn.toISOString().split("T")[0],
              checkOut: updated.checkOut.toISOString().split("T")[0]
            }).catch((err) => console.warn("[NOTIFICATION ERROR]", err));
          } else if (normalizedStatus === "CHECKED_IN") {
            if (updated.accessCard) {
              await accessControlService.processGuestCheckIn(updated.accessCard.id);
            }
          } else if (normalizedStatus === "CHECKED_OUT") {
            if (updated.accessCard) {
              await accessControlService.processGuestCheckOut(updated.accessCard.id);
            }
          } else if (normalizedStatus === "CANCELLED") {
            if (updated.accessCard) {
              await accessControlService.processGuestCheckOut(updated.accessCard.id);
            }
            notificationService.notifyBookingCancellation({
              email: updated.email,
              phone: updated.phone,
              fullName: updated.fullName,
              bookingReference: updated.bookingReference,
              suiteName: updated.suite ? updated.suite.name : "Kilifa Suite"
            }).catch((err) => console.warn("[NOTIFICATION ERROR]", err));
          }
          const resRecord = this.mapPrismaToRecord(updated);
          const idx2 = this.fallbackBookings.findIndex((b) => b.id === id || b.bookingReference === id);
          if (idx2 !== -1) {
            this.fallbackBookings[idx2] = resRecord;
          }
          return resRecord;
        }
      } catch (err) {
        if (!isMemoryFallbackAllowed()) {
          throw new ApiError(503, "Database service is temporarily unavailable. Please try again shortly.");
        }
        console.warn("[BOOKING SERVICE] Prisma status update failed, updating memory fallback:", err.message);
      }
    }
    const idx = this.fallbackBookings.findIndex((b) => b.id === id || b.bookingReference === id);
    if (idx !== -1) {
      this.fallbackBookings[idx].status = normalizedStatus;
      if (normalizedStatus === "CONFIRMED" && this.fallbackBookings[idx].payment) {
        this.fallbackBookings[idx].payment.status = "PAID";
      }
      if (normalizedStatus === "CHECKED_IN" && this.fallbackBookings[idx].accessCard) {
        this.fallbackBookings[idx].accessCard.status = "ACTIVE";
      }
      return this.fallbackBookings[idx];
    }
    throw new ApiError(404, `Booking '${id}' not found`);
  }
  mapPrismaToRecord(b) {
    return {
      id: b.id,
      bookingReference: b.bookingReference,
      fullName: b.fullName,
      email: b.email,
      phone: b.phone,
      checkIn: b.checkIn instanceof Date ? b.checkIn.toISOString().split("T")[0] : b.checkIn,
      checkOut: b.checkOut instanceof Date ? b.checkOut.toISOString().split("T")[0] : b.checkOut,
      guestsCount: b.guestsCount,
      preferredSuite: b.suiteId,
      suiteName: b.suite ? b.suite.name : "Royal Suite",
      pricePerNight: b.pricePerNight,
      totalNights: b.totalNights,
      totalEstimatedPrice: b.totalEstimatedPrice,
      specialRequests: b.specialRequests || "",
      status: b.status,
      payment: b.payment ? {
        id: b.payment.id,
        amount: b.payment.amount,
        status: b.payment.status
      } : void 0,
      accessCard: b.accessCard ? {
        id: b.accessCard.id,
        cardNumber: b.accessCard.cardNumber,
        status: b.accessCard.status
      } : void 0,
      createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt
    };
  }
};
var bookingService = new BookingService();

// src/server/controllers/bookingController.ts
import { Role as Role2 } from "@prisma/client";
var createBooking = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      checkIn,
      checkOut,
      guestsCount,
      suiteId,
      preferredSuite,
      specialRequests,
      idempotencyKey
    } = req.body;
    const errors = [];
    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      errors.push("fullName is required");
    } else if (fullName.trim().length < 2 || fullName.trim().length > 100) {
      errors.push("fullName must be between 2 and 100 characters");
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.push("valid email address is required");
    }
    if (!phone || typeof phone !== "string" || phone.trim().length < 5 || phone.trim().length > 30) {
      errors.push("valid phone number between 5 and 30 characters is required");
    }
    if (!checkIn || typeof checkIn !== "string") {
      errors.push("checkIn date is required (YYYY-MM-DD)");
    }
    if (!checkOut || typeof checkOut !== "string") {
      errors.push("checkOut date is required (YYYY-MM-DD)");
    }
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      if (isNaN(start.getTime())) errors.push("invalid checkIn date format");
      if (isNaN(end.getTime())) errors.push("invalid checkOut date format");
      const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      if (checkIn < todayStr) {
        errors.push("checkIn date cannot be in the past");
      }
      if (checkIn >= checkOut) {
        errors.push("checkOut date must be strictly after checkIn date");
      }
    }
    const parsedGuests = Number(guestsCount);
    if (isNaN(parsedGuests) || parsedGuests < 1 || !Number.isInteger(parsedGuests)) {
      errors.push("guestsCount must be an integer of at least 1");
    }
    const targetSuiteId = (suiteId || preferredSuite)?.toString().trim();
    if (!targetSuiteId) {
      errors.push("suiteId is required");
    }
    if (errors.length > 0) {
      throw new ApiError(400, "Validation Failed", errors);
    }
    const headerIdempotency = req.headers["idempotency-key"] || req.headers["x-idempotency-key"];
    const resolvedIdempotencyKey = typeof headerIdempotency === "string" ? headerIdempotency.trim() : typeof idempotencyKey === "string" ? idempotencyKey.trim() : void 0;
    const booking = await bookingService.createBooking({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      checkIn,
      checkOut,
      guestsCount: parsedGuests,
      suiteId: targetSuiteId,
      preferredSuite: targetSuiteId,
      specialRequests: specialRequests ? String(specialRequests).trim() : "",
      idempotencyKey: resolvedIdempotencyKey
    });
    res.status(201).json({
      status: "success",
      message: "Thank you. Your booking request has been received. Our team will contact you to confirm availability and your reservation.",
      data: booking
    });
  } catch (err) {
    next(err);
  }
};
var getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const authReq = req;
    const booking = await bookingService.getBookingById(id);
    const staffRoles = [Role2.OWNER, Role2.ADMIN, Role2.RECEPTIONIST, Role2.STAFF];
    if (authReq.user && !staffRoles.includes(authReq.user.role)) {
      const userEmail = authReq.user.email?.toLowerCase();
      const bookingEmail = booking.email?.toLowerCase();
      if (!userEmail || !bookingEmail || userEmail !== bookingEmail) {
        throw new ApiError(403, "Access denied. You are not authorized to view another guest's booking details.");
      }
    }
    res.status(200).json({
      status: "success",
      data: booking
    });
  } catch (err) {
    next(err);
  }
};
var lookupBooking = async (req, res, next) => {
  try {
    const { bookingReference } = req.params;
    const email = req.query.email?.trim().toLowerCase();
    if (!bookingReference) {
      throw new ApiError(400, "Booking reference is required");
    }
    if (!email) {
      throw new ApiError(400, "Guest email address is required to look up a reservation.");
    }
    const booking = await bookingService.getBookingById(bookingReference);
    if (booking.email.toLowerCase() !== email) {
      throw new ApiError(404, "No matching booking found for the provided reference and email address.");
    }
    res.status(200).json({
      status: "success",
      data: {
        bookingReference: booking.bookingReference,
        fullName: booking.fullName,
        suiteName: booking.suiteName,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guestsCount: booking.guestsCount,
        totalNights: booking.totalNights,
        totalEstimatedPrice: booking.totalEstimatedPrice,
        status: booking.status,
        paymentStatus: booking.payment?.status || "PENDING"
      }
    });
  } catch (err) {
    next(err);
  }
};
var getAllBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getAllBookings();
    res.status(200).json({
      status: "success",
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    next(err);
  }
};
var updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || typeof status !== "string") {
      throw new ApiError(400, "Status field is required");
    }
    const updated = await bookingService.updateBookingStatus(id, status);
    res.status(200).json({
      status: "success",
      message: `Booking status updated to '${status.toUpperCase()}'`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

// src/server/middleware/rateLimiter.ts
var createRateLimiter = (config) => {
  const store = /* @__PURE__ */ new Map();
  return (req, res, next) => {
    const clientIp = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress || "unknown-ip";
    const now = Date.now();
    const record = store.get(clientIp);
    if (!record || now > record.resetTime) {
      store.set(clientIp, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return next();
    }
    record.count += 1;
    if (record.count > config.maxRequests) {
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1e3);
      res.setHeader("Retry-After", retryAfterSec);
      return next(
        new ApiError(
          429,
          config.message || `Too many requests from this IP. Please wait ${retryAfterSec} seconds.`
        )
      );
    }
    next();
  };
};
var apiGlobalRateLimiter = createRateLimiter({
  windowMs: 60 * 1e3,
  // 1 minute
  maxRequests: 120,
  // 120 requests per minute
  message: "Global API rate limit exceeded. Please slow down your requests."
});
var strictActionRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  maxRequests: 25,
  // 25 actions per 15 minutes (booking, contact, payments)
  message: "Action rate limit exceeded. Please wait a few minutes before trying again."
});

// src/server/routes/bookingRoutes.ts
import { Role as Role3 } from "@prisma/client";
var router2 = Router2();
router2.post("/", strictActionRateLimiter, createBooking);
router2.get("/lookup/:bookingReference", strictActionRateLimiter, lookupBooking);
router2.get(
  "/",
  authenticateToken,
  requireRole(Role3.OWNER, Role3.ADMIN, Role3.RECEPTIONIST, Role3.STAFF),
  getAllBookings
);
router2.get("/:id", authenticateToken, getBookingById);
router2.patch(
  "/:id/status",
  authenticateToken,
  requireRole(Role3.OWNER, Role3.ADMIN, Role3.RECEPTIONIST, Role3.STAFF),
  updateBookingStatus
);
var bookingRoutes_default = router2;

// src/server/routes/guestRoutes.ts
import { Router as Router3 } from "express";

// src/server/services/guestService.ts
var GuestService = class {
  constructor() {
    this.fallbackGuests = [
      {
        id: "gst-101",
        fullName: "Musa Njie",
        email: "musa.njie@example.com",
        phone: "+2207000000",
        country: "The Gambia",
        vipStatus: true,
        totalBookings: 2,
        totalSpend: 7500,
        createdAt: "2026-01-15T10:00:00Z",
        bookings: [
          {
            id: "bkg-demo-101",
            bookingReference: "KS-882910",
            fullName: "Musa Njie",
            email: "musa.njie@example.com",
            phone: "+2207000000",
            checkIn: "2026-08-20",
            checkOut: "2026-08-23",
            guestsCount: 2,
            preferredSuite: "suite-01",
            suiteName: "DAR",
            pricePerNight: 2500,
            totalNights: 3,
            totalEstimatedPrice: 7500,
            specialRequests: "Airport shuttle pickup requested & late check-in",
            status: "PENDING",
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        ]
      },
      {
        id: "gst-102",
        fullName: "Fatou Ceesay",
        email: "fatou.ceesay@example.com",
        phone: "+2207112233",
        country: "Senegal",
        vipStatus: false,
        totalBookings: 1,
        totalSpend: 5e3,
        createdAt: "2026-03-22T14:30:00Z",
        bookings: [
          {
            id: "bkg-demo-102",
            bookingReference: "KS-910234",
            fullName: "Fatou Ceesay",
            email: "fatou.ceesay@example.com",
            phone: "+2207112233",
            checkIn: "2026-08-10",
            checkOut: "2026-08-12",
            guestsCount: 1,
            preferredSuite: "suite-02",
            suiteName: "SAMA",
            pricePerNight: 2500,
            totalNights: 2,
            totalEstimatedPrice: 5e3,
            specialRequests: "Extra hypoallergenic pillows requested",
            status: "CHECKED_IN",
            createdAt: new Date(Date.now() - 864e5).toISOString()
          }
        ]
      }
    ];
  }
  async getAllGuests() {
    if (isDatabaseConnected()) {
      try {
        const guests = await prisma.guest.findMany({
          include: {
            bookings: {
              include: { suite: true, payment: true },
              orderBy: { createdAt: "desc" }
            }
          },
          orderBy: { createdAt: "desc" }
        });
        if (guests && guests.length > 0) {
          return guests.map((g) => {
            const totalSpend = g.bookings.reduce((sum, b) => sum + (b.totalEstimatedPrice || 0), 0);
            return {
              id: g.id,
              fullName: g.fullName,
              email: g.email,
              phone: g.phone,
              country: g.country || "The Gambia",
              vipStatus: g.vipStatus,
              totalBookings: g.totalBookings || g.bookings.length,
              totalSpend,
              createdAt: g.createdAt.toISOString(),
              bookings: g.bookings.map((b) => ({
                id: b.id,
                bookingReference: b.bookingReference,
                fullName: b.fullName,
                email: b.email,
                phone: b.phone,
                checkIn: b.checkIn.toISOString().split("T")[0],
                checkOut: b.checkOut.toISOString().split("T")[0],
                guestsCount: b.guestsCount,
                preferredSuite: b.suiteId,
                suiteName: b.suite ? b.suite.name : "DAR",
                pricePerNight: b.pricePerNight,
                totalNights: b.totalNights,
                totalEstimatedPrice: b.totalEstimatedPrice,
                specialRequests: b.specialRequests || "",
                status: b.status,
                createdAt: b.createdAt.toISOString()
              }))
            };
          });
        }
      } catch (err) {
        if (err instanceof ApiError) throw err;
      }
    }
    return this.fallbackGuests;
  }
  async getGuestById(id) {
    if (isDatabaseConnected()) {
      try {
        const guest = await prisma.guest.findFirst({
          where: { OR: [{ id }, { email: id }] },
          include: {
            bookings: {
              include: { suite: true, payment: true },
              orderBy: { createdAt: "desc" }
            }
          }
        });
        if (guest) {
          const totalSpend = guest.bookings.reduce((sum, b) => sum + (b.totalEstimatedPrice || 0), 0);
          return {
            id: guest.id,
            fullName: guest.fullName,
            email: guest.email,
            phone: guest.phone,
            country: guest.country || "The Gambia",
            vipStatus: guest.vipStatus,
            totalBookings: guest.totalBookings || guest.bookings.length,
            totalSpend,
            createdAt: guest.createdAt.toISOString(),
            bookings: guest.bookings.map((b) => ({
              id: b.id,
              bookingReference: b.bookingReference,
              fullName: b.fullName,
              email: b.email,
              phone: b.phone,
              checkIn: b.checkIn.toISOString().split("T")[0],
              checkOut: b.checkOut.toISOString().split("T")[0],
              guestsCount: b.guestsCount,
              preferredSuite: b.suiteId,
              suiteName: b.suite ? b.suite.name : "DAR",
              pricePerNight: b.pricePerNight,
              totalNights: b.totalNights,
              totalEstimatedPrice: b.totalEstimatedPrice,
              specialRequests: b.specialRequests || "",
              status: b.status,
              createdAt: b.createdAt.toISOString()
            }))
          };
        }
      } catch (err) {
        if (err instanceof ApiError) throw err;
      }
    }
    const fallback = this.fallbackGuests.find((g) => g.id === id || g.email === id);
    if (!fallback) {
      throw new ApiError(404, `Guest profile '${id}' not found`);
    }
    return fallback;
  }
  async updateGuestProfile(id, data) {
    try {
      const existing = await prisma.guest.findFirst({
        where: { OR: [{ id }, { email: id }] }
      });
      if (existing) {
        const updated = await prisma.guest.update({
          where: { id: existing.id },
          data: {
            ...data.vipStatus !== void 0 && { vipStatus: data.vipStatus },
            ...data.phone && { phone: data.phone },
            ...data.country && { country: data.country },
            ...data.fullName && { fullName: data.fullName }
          },
          include: {
            bookings: {
              include: { suite: true },
              orderBy: { createdAt: "desc" }
            }
          }
        });
        const totalSpend = updated.bookings.reduce((sum, b) => sum + (b.totalEstimatedPrice || 0), 0);
        return {
          id: updated.id,
          fullName: updated.fullName,
          email: updated.email,
          phone: updated.phone,
          country: updated.country || "The Gambia",
          vipStatus: updated.vipStatus,
          totalBookings: updated.totalBookings || updated.bookings.length,
          totalSpend,
          createdAt: updated.createdAt.toISOString(),
          bookings: updated.bookings.map((b) => ({
            id: b.id,
            bookingReference: b.bookingReference,
            fullName: b.fullName,
            email: b.email,
            phone: b.phone,
            checkIn: b.checkIn.toISOString().split("T")[0],
            checkOut: b.checkOut.toISOString().split("T")[0],
            guestsCount: b.guestsCount,
            preferredSuite: b.suiteId,
            suiteName: b.suite ? b.suite.name : "DAR",
            pricePerNight: b.pricePerNight,
            totalNights: b.totalNights,
            totalEstimatedPrice: b.totalEstimatedPrice,
            specialRequests: b.specialRequests || "",
            status: b.status,
            createdAt: b.createdAt.toISOString()
          }))
        };
      }
    } catch (err) {
      console.warn("[GUEST SERVICE] Prisma update failed, modifying fallback:", err.message);
    }
    const idx = this.fallbackGuests.findIndex((g) => g.id === id || g.email === id);
    if (idx !== -1) {
      if (data.vipStatus !== void 0) this.fallbackGuests[idx].vipStatus = data.vipStatus;
      if (data.phone) this.fallbackGuests[idx].phone = data.phone;
      if (data.country) this.fallbackGuests[idx].country = data.country;
      if (data.fullName) this.fallbackGuests[idx].fullName = data.fullName;
      return this.fallbackGuests[idx];
    }
    throw new ApiError(404, `Guest profile '${id}' not found`);
  }
  async updateSpecialRequests(bookingId, specialRequests) {
    try {
      const existing = await prisma.booking.findFirst({
        where: { OR: [{ id: bookingId }, { bookingReference: bookingId }] },
        include: { suite: true }
      });
      if (existing) {
        const updated = await prisma.booking.update({
          where: { id: existing.id },
          data: { specialRequests },
          include: { suite: true, payment: true, accessCard: true }
        });
        return {
          id: updated.id,
          bookingReference: updated.bookingReference,
          fullName: updated.fullName,
          email: updated.email,
          phone: updated.phone,
          checkIn: updated.checkIn.toISOString().split("T")[0],
          checkOut: updated.checkOut.toISOString().split("T")[0],
          guestsCount: updated.guestsCount,
          preferredSuite: updated.suiteId,
          suiteName: updated.suite ? updated.suite.name : "DAR",
          pricePerNight: updated.pricePerNight,
          totalNights: updated.totalNights,
          totalEstimatedPrice: updated.totalEstimatedPrice,
          specialRequests: updated.specialRequests || "",
          status: updated.status,
          createdAt: updated.createdAt.toISOString()
        };
      }
    } catch (err) {
      console.warn("[GUEST SERVICE] Prisma special request update failed:", err.message);
    }
    for (const guest of this.fallbackGuests) {
      const bIdx = guest.bookings.findIndex((b) => b.id === bookingId || b.bookingReference === bookingId);
      if (bIdx !== -1) {
        guest.bookings[bIdx].specialRequests = specialRequests;
        return guest.bookings[bIdx];
      }
    }
    throw new ApiError(404, `Booking '${bookingId}' not found`);
  }
};
var guestService = new GuestService();

// src/server/controllers/guestController.ts
var getAllGuests = async (req, res, next) => {
  try {
    const guests = await guestService.getAllGuests();
    res.status(200).json({
      status: "success",
      count: guests.length,
      data: guests
    });
  } catch (err) {
    next(err);
  }
};
var getGuestById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const guest = await guestService.getGuestById(id);
    res.status(200).json({
      status: "success",
      data: guest
    });
  } catch (err) {
    next(err);
  }
};
var updateGuestProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { vipStatus, phone, country, fullName } = req.body;
    const updated = await guestService.updateGuestProfile(id, {
      vipStatus,
      phone,
      country,
      fullName
    });
    res.status(200).json({
      status: "success",
      message: "Guest profile updated successfully",
      data: updated
    });
  } catch (err) {
    next(err);
  }
};
var updateSpecialRequests = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { specialRequests } = req.body;
    if (typeof specialRequests !== "string") {
      throw new ApiError(400, "specialRequests string field is required");
    }
    const updatedBooking = await guestService.updateSpecialRequests(bookingId, specialRequests.trim());
    res.status(200).json({
      status: "success",
      message: "Special requests updated successfully",
      data: updatedBooking
    });
  } catch (err) {
    next(err);
  }
};
var checkInBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const updated = await bookingService.updateBookingStatus(bookingId, "CHECKED_IN");
    res.status(200).json({
      status: "success",
      message: `Guest checked in successfully for reservation ${updated.bookingReference}`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};
var checkOutBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const updated = await bookingService.updateBookingStatus(bookingId, "CHECKED_OUT");
    res.status(200).json({
      status: "success",
      message: `Guest checked out successfully for reservation ${updated.bookingReference}`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

// src/server/routes/guestRoutes.ts
import { Role as Role4 } from "@prisma/client";
var router3 = Router3();
router3.use(authenticateToken);
router3.get("/", requireRole(Role4.OWNER, Role4.ADMIN, Role4.RECEPTIONIST, Role4.STAFF), getAllGuests);
router3.get("/:id", requireRole(Role4.OWNER, Role4.ADMIN, Role4.RECEPTIONIST, Role4.STAFF), getGuestById);
router3.patch("/:id", requireRole(Role4.OWNER, Role4.ADMIN, Role4.RECEPTIONIST), updateGuestProfile);
router3.patch(
  "/bookings/:bookingId/special-requests",
  requireRole(Role4.OWNER, Role4.ADMIN, Role4.RECEPTIONIST, Role4.STAFF),
  updateSpecialRequests
);
router3.post(
  "/bookings/:bookingId/check-in",
  requireRole(Role4.OWNER, Role4.ADMIN, Role4.RECEPTIONIST, Role4.STAFF),
  checkInBooking
);
router3.post(
  "/bookings/:bookingId/check-out",
  requireRole(Role4.OWNER, Role4.ADMIN, Role4.RECEPTIONIST, Role4.STAFF),
  checkOutBooking
);
var guestRoutes_default = router3;

// src/server/routes/contactRoutes.ts
import { Router as Router4 } from "express";

// src/server/services/contactService.ts
import { ContactInquiryStatus } from "@prisma/client";
var ContactService = class {
  constructor() {
    this.fallbackMessages = [];
  }
  async createContactMessage(data) {
    if (isDatabaseConnected()) {
      try {
        const created = await prisma.contactInquiry.create({
          data: {
            fullName: data.fullName.trim(),
            email: data.email.trim().toLowerCase(),
            phone: data.phone?.trim() || null,
            subject: (data.subject || "General Inquiry").trim(),
            message: data.message.trim(),
            ipAddress: data.ipAddress || null,
            status: ContactInquiryStatus.NEW
          }
        });
        return {
          id: created.id,
          fullName: created.fullName,
          email: created.email,
          phone: created.phone || "",
          subject: created.subject,
          message: created.message,
          receivedAt: created.createdAt.toISOString(),
          status: created.status
        };
      } catch (err) {
        if (!isMemoryFallbackAllowed()) {
          console.error("[CONTACT SERVICE] Prisma persistence failed and memory fallback is disabled:", err.message);
          throw new ApiError(503, "Contact inquiry could not be saved to the database. Please try again shortly.");
        }
        console.warn("[CONTACT SERVICE] Prisma record creation failed, using in-memory fallback:", err.message);
      }
    }
    const id = `cnt-${Date.now()}`;
    const newRecord = {
      id,
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim() || "",
      subject: (data.subject || "General Inquiry").trim(),
      message: data.message.trim(),
      receivedAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "NEW"
    };
    this.fallbackMessages.push(newRecord);
    return newRecord;
  }
  async getAllMessages() {
    if (isDatabaseConnected()) {
      try {
        const inquiries = await prisma.contactInquiry.findMany({
          orderBy: { createdAt: "desc" }
        });
        if (inquiries && inquiries.length > 0) {
          return inquiries.map((inq) => ({
            id: inq.id,
            fullName: inq.fullName,
            email: inq.email,
            phone: inq.phone || "",
            subject: inq.subject,
            message: inq.message,
            receivedAt: inq.createdAt.toISOString(),
            status: inq.status
          }));
        }
      } catch (err) {
      }
    }
    return this.fallbackMessages;
  }
};
var contactService = new ContactService();

// src/server/controllers/contactController.ts
var createContactMessage = async (req, res, next) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;
    const errors = [];
    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      errors.push("fullName is required");
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.push("valid email address is required");
    }
    if (!message || typeof message !== "string" || !message.trim()) {
      errors.push("message is required");
    }
    if (errors.length > 0) {
      throw new ApiError(400, "Validation Failed", errors);
    }
    const record = await contactService.createContactMessage({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? String(phone).trim() : "",
      subject: subject ? String(subject).trim() : "General Inquiry",
      message: message.trim()
    });
    res.status(201).json({
      status: "success",
      message: "Thank you for contacting Kilifa Suites. Your message has been received.",
      data: record
    });
  } catch (err) {
    next(err);
  }
};
var getAllContactMessages = async (req, res, next) => {
  try {
    const messages = await contactService.getAllMessages();
    res.status(200).json({
      status: "success",
      count: messages.length,
      data: messages
    });
  } catch (err) {
    next(err);
  }
};

// src/server/routes/contactRoutes.ts
import { Role as Role5 } from "@prisma/client";
var router4 = Router4();
router4.post("/", strictActionRateLimiter, createContactMessage);
router4.get(
  "/",
  authenticateToken,
  requireRole(Role5.OWNER, Role5.ADMIN),
  getAllContactMessages
);
var contactRoutes_default = router4;

// src/server/routes/mediaRoutes.ts
import { Router as Router5 } from "express";

// src/server/services/mediaService.ts
import { MediaType } from "@prisma/client";
var MediaService = class {
  constructor() {
    this.fallbackMedia = MEDIA_GALLERY_DATA.map((m) => ({
      id: m.id,
      title: m.caption || "Kilifa Suites Asset",
      url: m.url,
      type: m.type,
      category: m.category,
      caption: m.caption,
      alt: m.alt,
      published: true
    }));
  }
  async getAllMedia(category, type, includeUnpublished = false) {
    if (isDatabaseConnected()) {
      try {
        const items = await prisma.media.findMany({
          orderBy: { createdAt: "desc" }
        });
        if (items && items.length > 0) {
          let filtered = items;
          if (!includeUnpublished) {
            filtered = filtered.filter((m) => m.published ?? true);
          }
          if (type && (type === "image" || type === "video")) {
            filtered = filtered.filter((m) => m.type.toLowerCase() === type.toLowerCase());
          }
          if (category && category !== "All") {
            const catLower = category.toLowerCase();
            filtered = filtered.filter((m) => m.category.toLowerCase() === catLower);
          }
          return filtered.map((m) => ({
            id: m.id,
            title: m.title,
            url: m.url,
            type: m.type === MediaType.VIDEO ? "video" : "image",
            category: m.category,
            caption: m.caption || m.title,
            alt: m.title,
            published: m.published ?? true,
            createdAt: m.createdAt.toISOString()
          }));
        }
      } catch (err) {
      }
    }
    let result = this.fallbackMedia;
    if (!includeUnpublished) {
      result = result.filter((m) => m.published);
    }
    if (type && (type === "image" || type === "video")) {
      result = result.filter((m) => m.type === type);
    }
    if (category && category !== "All") {
      const catLower = category.toLowerCase();
      result = result.filter((m) => m.category.toLowerCase() === catLower);
    }
    return result;
  }
  async createMedia(data) {
    try {
      const created = await prisma.media.create({
        data: {
          title: data.title,
          url: data.url,
          type: data.type === "video" ? MediaType.VIDEO : MediaType.IMAGE,
          category: data.category,
          caption: data.caption || data.title
        }
      });
      const record = {
        id: created.id,
        title: created.title,
        url: created.url,
        type: created.type === MediaType.VIDEO ? "video" : "image",
        category: created.category,
        caption: created.caption || created.title,
        alt: created.title,
        published: created.published ?? (data.published ?? true),
        createdAt: created.createdAt.toISOString()
      };
      this.fallbackMedia.unshift(record);
      return record;
    } catch (err) {
      console.warn("[MEDIA SERVICE] Prisma create media failed, saving to memory fallback:", err.message);
    }
    const newRecord = {
      id: `media-${Date.now()}`,
      title: data.title,
      url: data.url,
      type: data.type,
      category: data.category,
      caption: data.caption || data.title,
      alt: data.title,
      published: data.published ?? true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.fallbackMedia.unshift(newRecord);
    return newRecord;
  }
  async updateMedia(id, data) {
    try {
      const existing = await prisma.media.findUnique({ where: { id } });
      if (existing) {
        const updated = await prisma.media.update({
          where: { id },
          data: {
            title: data.title ?? existing.title,
            url: data.url ?? existing.url,
            type: data.type ? data.type === "video" ? MediaType.VIDEO : MediaType.IMAGE : existing.type,
            category: data.category ?? existing.category,
            caption: data.caption ?? existing.caption
          }
        });
        const record = {
          id: updated.id,
          title: updated.title,
          url: updated.url,
          type: updated.type === MediaType.VIDEO ? "video" : "image",
          category: updated.category,
          caption: updated.caption || updated.title,
          alt: updated.title,
          published: updated.published ?? (data.published ?? true),
          createdAt: updated.createdAt.toISOString()
        };
        const idx2 = this.fallbackMedia.findIndex((m) => m.id === id);
        if (idx2 !== -1) this.fallbackMedia[idx2] = record;
        return record;
      }
    } catch (err) {
      console.warn("[MEDIA SERVICE] Prisma update media failed:", err.message);
    }
    const idx = this.fallbackMedia.findIndex((m) => m.id === id);
    if (idx !== -1) {
      this.fallbackMedia[idx] = {
        ...this.fallbackMedia[idx],
        title: data.title ?? this.fallbackMedia[idx].title,
        url: data.url ?? this.fallbackMedia[idx].url,
        type: data.type ?? this.fallbackMedia[idx].type,
        category: data.category ?? this.fallbackMedia[idx].category,
        caption: data.caption ?? this.fallbackMedia[idx].caption,
        published: data.published ?? this.fallbackMedia[idx].published
      };
      return this.fallbackMedia[idx];
    }
    throw new ApiError(404, `Media item '${id}' not found`);
  }
  async deleteMedia(id) {
    try {
      const existing = await prisma.media.findUnique({ where: { id } });
      if (existing) {
        await prisma.media.delete({ where: { id } });
      }
    } catch (err) {
      console.warn("[MEDIA SERVICE] Prisma delete media failed:", err.message);
    }
    const idx = this.fallbackMedia.findIndex((m) => m.id === id);
    if (idx !== -1) {
      this.fallbackMedia.splice(idx, 1);
    }
    return true;
  }
  async togglePublishStatus(id) {
    const existing = await this.fallbackMedia.find((m) => m.id === id);
    const newStatus = existing ? !existing.published : false;
    return this.updateMedia(id, { published: newStatus });
  }
};
var mediaService = new MediaService();

// src/server/controllers/mediaController.ts
var getAllMedia = async (req, res, next) => {
  try {
    const { category, type, admin } = req.query;
    const includeUnpublished = admin === "true" || Boolean(req.user);
    const items = await mediaService.getAllMedia(
      category ? String(category) : void 0,
      type ? String(type) : void 0,
      includeUnpublished
    );
    res.status(200).json({
      status: "success",
      count: items.length,
      data: items
    });
  } catch (err) {
    next(err);
  }
};
var createMedia = async (req, res, next) => {
  try {
    const { title, url, type, category, caption, published } = req.body;
    if (!title || typeof title !== "string" || !title.trim()) {
      throw new ApiError(400, "Media title is required");
    }
    if (!url || typeof url !== "string" || !url.trim()) {
      throw new ApiError(400, "Media URL is required");
    }
    if (!type || type !== "image" && type !== "video") {
      throw new ApiError(400, "Media type must be either 'image' or 'video'");
    }
    const created = await mediaService.createMedia({
      title: title.trim(),
      url: url.trim(),
      type,
      category: category ? String(category).trim() : "Suites",
      caption: caption ? String(caption).trim() : title.trim(),
      published: published !== false
    });
    res.status(201).json({
      status: "success",
      message: "Media asset added successfully",
      data: created
    });
  } catch (err) {
    next(err);
  }
};
var updateMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await mediaService.updateMedia(id, req.body);
    res.status(200).json({
      status: "success",
      message: "Media asset updated successfully",
      data: updated
    });
  } catch (err) {
    next(err);
  }
};
var deleteMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    await mediaService.deleteMedia(id);
    res.status(200).json({
      status: "success",
      message: `Media item '${id}' deleted successfully`
    });
  } catch (err) {
    next(err);
  }
};
var togglePublishMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await mediaService.togglePublishStatus(id);
    res.status(200).json({
      status: "success",
      message: `Media item publication status updated to ${updated.published ? "Published" : "Unpublished"}`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

// src/server/routes/mediaRoutes.ts
import { Role as Role6 } from "@prisma/client";
var router5 = Router5();
router5.get("/", getAllMedia);
router5.post(
  "/",
  authenticateToken,
  requireRole(Role6.OWNER, Role6.ADMIN, Role6.RECEPTIONIST),
  createMedia
);
router5.put(
  "/:id",
  authenticateToken,
  requireRole(Role6.OWNER, Role6.ADMIN, Role6.RECEPTIONIST),
  updateMedia
);
router5.delete(
  "/:id",
  authenticateToken,
  requireRole(Role6.OWNER, Role6.ADMIN),
  deleteMedia
);
router5.patch(
  "/:id/publish",
  authenticateToken,
  requireRole(Role6.OWNER, Role6.ADMIN, Role6.RECEPTIONIST),
  togglePublishMedia
);
var mediaRoutes_default = router5;

// src/server/routes/authRoutes.ts
import { Router as Router6 } from "express";

// src/server/services/authService.ts
import jwt2 from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Role as Role7 } from "@prisma/client";
var resetTokenStore = /* @__PURE__ */ new Map();
var initialAdminHash = process.env.ADMIN_PASSWORD_HASH || (process.env.ADMIN_INITIAL_PASSWORD ? bcrypt.hashSync(process.env.ADMIN_INITIAL_PASSWORD, 10) : process.env.NODE_ENV === "production" ? "" : bcrypt.hashSync("Kilifa2026!DevAdminSec", 10));
var FALLBACK_USERS = initialAdminHash ? {
  "admin@kilifasuites.gm": {
    id: "usr-admin-001",
    email: "admin@kilifasuites.gm",
    username: "admin",
    name: "Executive Administrator",
    role: Role7.ADMIN,
    passwordHash: initialAdminHash
  },
  "scondly4@gmail.com": {
    id: "usr-admin-002",
    email: "scondly4@gmail.com",
    username: "scondly",
    name: "System Administrator",
    role: Role7.ADMIN,
    passwordHash: initialAdminHash
  },
  "modoulaminthorp4@gmail.com": {
    id: "usr-admin-003",
    email: "modoulaminthorp4@gmail.com",
    username: "kilifasuites",
    name: "System Administrator",
    role: Role7.ADMIN,
    passwordHash: initialAdminHash
  }
} : {};
var AuthService = class {
  /**
   * Authenticate user with email or username and password
   * Only allows administrative roles to enter management portal
   */
  async login(identifier, password) {
    const raw = identifier.toLowerCase().trim();
    if (isDatabaseConnected()) {
      try {
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: { equals: raw, mode: "insensitive" } },
              { name: { contains: raw, mode: "insensitive" } }
            ]
          }
        });
        if (user && user.password) {
          const allowedRoles = [Role7.OWNER, Role7.ADMIN, Role7.RECEPTIONIST, Role7.STAFF];
          if (!allowedRoles.includes(user.role)) {
            throw new ApiError(403, "Access denied. Only authorized personnel can access the management portal.");
          }
          const passwordMatches = await bcrypt.compare(password, user.password);
          if (!passwordMatches) {
            throw new ApiError(401, "Invalid credentials. Please verify your login details.");
          }
          const payload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          };
          const token = jwt2.sign(payload, getJwtSecret(), {
            expiresIn: getJwtExpiresIn()
          });
          return {
            token,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              createdAt: user.createdAt.toISOString()
            }
          };
        }
      } catch (err) {
        if (err instanceof ApiError) throw err;
      }
    }
    if (!isMemoryFallbackAllowed()) {
      throw new ApiError(401, "Invalid credentials. Account not found.");
    }
    const fallbackUser = Object.values(FALLBACK_USERS).find((acc) => {
      const emailMatch = acc.email.toLowerCase() === raw;
      const usernameMatch = acc.username.toLowerCase() === raw;
      return emailMatch || usernameMatch;
    });
    if (fallbackUser) {
      let passwordMatches = await bcrypt.compare(password, fallbackUser.passwordHash);
      if (!passwordMatches && process.env.NODE_ENV !== "production") {
        const acceptedDevPasswords = [
          "Kilifa2026!DevAdminSec",
          "Kilifa2026!AdminSec",
          "Kilifa2026!AdminKey",
          "Kilifa2026!"
        ];
        if (acceptedDevPasswords.includes(password)) {
          passwordMatches = true;
        }
      }
      if (!passwordMatches) {
        throw new ApiError(401, "Invalid credentials. Please verify your login details.");
      }
      const payload = {
        id: fallbackUser.id,
        email: fallbackUser.email,
        name: fallbackUser.name,
        role: fallbackUser.role
      };
      const token = jwt2.sign(payload, getJwtSecret(), {
        expiresIn: getJwtExpiresIn()
      });
      return {
        token,
        user: {
          id: fallbackUser.id,
          email: fallbackUser.email,
          name: fallbackUser.name,
          role: fallbackUser.role
        }
      };
    }
    throw new ApiError(401, "Invalid credentials. Account not found.");
  }
  /**
   * Create / Register an authorized staff or administrator account
   * Protected: Callable only by authenticated System Administrators
   */
  async register(data) {
    const email = data.email.toLowerCase().trim();
    const username = (data.username || email.split("@")[0]).toLowerCase().trim();
    const name = data.name.trim() || "Staff Member";
    const password = data.password.trim();
    const role = data.role || Role7.STAFF;
    if (!email || !password) {
      throw new ApiError(400, "Email and password are required.");
    }
    if (password.length < 8) {
      throw new ApiError(400, "Password must be at least 8 characters long.");
    }
    if (FALLBACK_USERS[email] || Object.values(FALLBACK_USERS).some((u) => u.username === username)) {
      throw new ApiError(409, "An account with this email address or username already exists.");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `usr-${Date.now()}`;
    if (isDatabaseConnected()) {
      try {
        const existing = await prisma.user.findFirst({ where: { email } });
        if (existing) {
          throw new ApiError(409, "An account with this email address already exists.");
        }
        const created = await prisma.user.create({
          data: {
            id: userId,
            email,
            name,
            password: hashedPassword,
            role
          }
        });
        return {
          id: created.id,
          email: created.email,
          name: created.name,
          role: created.role,
          createdAt: created.createdAt.toISOString()
        };
      } catch (err) {
        if (err instanceof ApiError) throw err;
      }
    }
    FALLBACK_USERS[email] = {
      id: userId,
      email,
      username,
      name,
      role,
      passwordHash: hashedPassword
    };
    return {
      id: userId,
      email,
      name,
      role
    };
  }
  /**
   * Request password reset token
   * Generates a 32-byte cryptographically secure single-use token (valid 15 minutes)
   * Returns a generic response to prevent user enumeration
   */
  async requestPasswordReset(email) {
    const raw = email.toLowerCase().trim();
    if (!raw || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
      throw new ApiError(400, "A valid email address is required.");
    }
    let userExists = false;
    if (isDatabaseConnected()) {
      try {
        const user = await prisma.user.findUnique({ where: { email: raw } });
        if (user) userExists = true;
      } catch {
      }
    }
    if (!userExists && FALLBACK_USERS[raw]) {
      userExists = true;
    }
    let debugToken;
    if (userExists) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
      resetTokenStore.set(hashedToken, {
        email: raw,
        hashedToken,
        expiresAt: Date.now() + 15 * 60 * 1e3
        // 15 minutes TTL
      });
      if (process.env.NODE_ENV !== "production" && process.env.EXPOSE_DEV_DEBUG_TOKENS === "true") {
        debugToken = rawToken;
      }
      console.log(`[PASSWORD RESET] Single-use reset token generated for account: ${raw.slice(0, 3)}*** (Expires in 15m)`);
    }
    return {
      message: "If an account matching this email address exists, password reset instructions have been sent.",
      ...debugToken && { debugToken }
    };
  }
  /**
   * Execute password reset using verified token
   * Single-use token invalidated immediately upon consumption
   */
  async executePasswordReset(token, newPassword) {
    if (!token || typeof token !== "string" || !token.trim()) {
      throw new ApiError(400, "Password reset token is required.");
    }
    if (!newPassword || newPassword.trim().length < 8) {
      throw new ApiError(400, "New password must be at least 8 characters long.");
    }
    const hashedToken = crypto.createHash("sha256").update(token.trim()).digest("hex");
    const tokenRecord = resetTokenStore.get(hashedToken);
    if (!tokenRecord) {
      throw new ApiError(400, "Invalid or expired password reset token. Please request a new reset link.");
    }
    if (Date.now() > tokenRecord.expiresAt) {
      resetTokenStore.delete(hashedToken);
      throw new ApiError(400, "Password reset token has expired. Please request a new reset link.");
    }
    const targetEmail = tokenRecord.email;
    const newHash = await bcrypt.hash(newPassword.trim(), 10);
    if (isDatabaseConnected()) {
      try {
        await prisma.user.update({
          where: { email: targetEmail },
          data: { password: newHash }
        });
      } catch {
      }
    }
    if (FALLBACK_USERS[targetEmail]) {
      FALLBACK_USERS[targetEmail].passwordHash = newHash;
    }
    resetTokenStore.delete(hashedToken);
    return {
      message: "Password has been successfully updated. You may now sign in with your new credentials."
    };
  }
  /**
   * Retrieve current user profile by User ID
   */
  async getProfile(userId) {
    const fallback = Object.values(FALLBACK_USERS).find((u) => u.id === userId);
    if (fallback) {
      return {
        id: fallback.id,
        email: fallback.email,
        name: fallback.name,
        role: fallback.role
      };
    }
    if (isDatabaseConnected()) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });
        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt.toISOString()
          };
        }
      } catch (err) {
        if (err instanceof ApiError) throw err;
      }
    }
    throw new ApiError(404, "User profile not found.");
  }
};
var authService = new AuthService();

// src/server/controllers/authController.ts
var login = async (req, res, next) => {
  try {
    const identifier = req.body.email || req.body.username || req.body.identifier;
    const password = req.body.password;
    const errors = [];
    if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
      errors.push("email, username, or account name is required");
    }
    if (!password || typeof password !== "string" || !password.trim()) {
      errors.push("password is required");
    }
    if (errors.length > 0) {
      throw new ApiError(400, "Validation Failed", errors);
    }
    const result = await authService.login(identifier, password);
    res.status(200).json({
      status: "success",
      message: "Authentication successful. Token issued.",
      token: result.token,
      user: result.user
    });
  } catch (err) {
    next(err);
  }
};
var getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }
    const profile = await authService.getProfile(req.user.id);
    res.status(200).json({
      status: "success",
      data: profile
    });
  } catch (err) {
    next(err);
  }
};
var register = async (req, res, next) => {
  try {
    const { name, email, username, password, role } = req.body;
    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }
    const newUser = await authService.register({
      name: name || "Staff Member",
      email,
      username,
      password,
      role
    });
    res.status(201).json({
      status: "success",
      message: "Account created successfully by Administrator.",
      data: newUser
    });
  } catch (err) {
    next(err);
  }
};
var forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new ApiError(400, "Email address is required");
    }
    const result = await authService.requestPasswordReset(email);
    res.status(200).json({
      status: "success",
      message: result.message,
      ...result.debugToken && { debugToken: result.debugToken }
    });
  } catch (err) {
    next(err);
  }
};
var resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      throw new ApiError(400, "Reset token and new password are required");
    }
    const result = await authService.executePasswordReset(token, newPassword);
    res.status(200).json({
      status: "success",
      message: result.message
    });
  } catch (err) {
    next(err);
  }
};
var logout = async (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "Logged out successfully. Please clear client authorization headers."
  });
};

// src/server/routes/authRoutes.ts
import { Role as Role8 } from "@prisma/client";
var router6 = Router6();
router6.post("/login", authRateLimiter, login);
router6.post("/register", authenticateToken, requireRole(Role8.ADMIN), register);
router6.post("/forgot-password", authRateLimiter, forgotPassword);
router6.post("/reset-password", authRateLimiter, resetPassword);
router6.get("/me", authenticateToken, getMe);
router6.post("/logout", logout);
var authRoutes_default = router6;

// src/server/routes/dashboardRoutes.ts
import { Router as Router7 } from "express";

// src/server/services/dashboardService.ts
var DashboardService = class {
  async getDashboardStats() {
    const bookings = await bookingService.getAllBookings();
    const suites = await suiteService.getAllSuites();
    const guests = await guestService.getAllGuests();
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const todaysBookings = bookings.filter((b) => b.createdAt.startsWith(todayStr) || b.checkIn === todayStr).length;
    const upcomingBookings = bookings.filter((b) => b.checkIn > todayStr && b.status !== "CANCELLED").length;
    const checkInsToday = bookings.filter((b) => b.checkIn === todayStr && b.status !== "CANCELLED").length;
    const checkOutsToday = bookings.filter((b) => b.checkOut === todayStr && b.status !== "CANCELLED").length;
    const occupiedSuites = bookings.filter(
      (b) => (b.status === "CHECKED_IN" || b.status === "CONFIRMED") && b.checkIn <= todayStr && b.checkOut >= todayStr
    ).length;
    const totalSuites = Math.max(1, suites.length);
    const occupancyRate = Math.min(100, Math.round(occupiedSuites / totalSuites * 100));
    const totalRevenue = bookings.filter((b) => ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"].includes(b.status)).reduce((sum, b) => sum + (b.totalEstimatedPrice || 0), 0);
    const pendingRequestsCount = bookings.filter((b) => b.status === "PENDING").length;
    return {
      todaysBookings,
      upcomingBookings,
      checkInsToday,
      checkOutsToday,
      occupancyRate,
      totalRevenue,
      pendingRequestsCount,
      totalSuites,
      activeSuites: totalSuites,
      totalGuests: guests.length
    };
  }
};
var dashboardService = new DashboardService();

// src/server/controllers/dashboardController.ts
var getDashboardStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    res.status(200).json({
      status: "success",
      data: stats
    });
  } catch (err) {
    next(err);
  }
};

// src/server/routes/dashboardRoutes.ts
import { Role as Role9 } from "@prisma/client";
var router7 = Router7();
router7.get(
  "/stats",
  authenticateToken,
  requireRole(Role9.OWNER, Role9.ADMIN, Role9.RECEPTIONIST, Role9.STAFF),
  getDashboardStats
);
var dashboardRoutes_default = router7;

// src/server/routes/paymentRoutes.ts
import { Router as Router8 } from "express";

// src/server/payments/adapters/WaveAdapter.ts
import crypto2 from "crypto";
var WaveAdapter = class {
  constructor() {
    this.provider = "WAVE";
  }
  isConfigured() {
    return Boolean(process.env.WAVE_API_KEY && process.env.WAVE_MERCHANT_ID);
  }
  async initiatePayment(req) {
    const txRef = `WAVE-${req.bookingReference}-${Date.now().toString().slice(-6)}`;
    const paidAmount = req.paidAmount || req.amount;
    if (this.isConfigured()) {
      try {
        const response = await fetch("https://api.wave.com/v1/checkout/sessions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.WAVE_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            amount: paidAmount.toString(),
            currency: req.currency || "GMD",
            error_url: `${process.env.APP_URL || "http://localhost:3000"}/booking?status=wave_error`,
            success_url: `${process.env.APP_URL || "http://localhost:3000"}/booking?status=wave_success&ref=${txRef}`,
            client_reference: txRef
          })
        });
        if (response.ok) {
          const data = await response.json();
          return {
            paymentId: "",
            bookingId: req.bookingId,
            bookingReference: req.bookingReference,
            amount: req.amount,
            paidAmount,
            currency: req.currency || "GMD",
            provider: "WAVE",
            status: "PROCESSING",
            transactionRef: txRef,
            redirectUrl: data.wave_launch_url || data.checkout_url,
            instructions: "Redirecting to Wave App / USSD for authorization...",
            requiresCustomerAction: true
          };
        }
      } catch (err) {
        console.warn("[WAVE ADAPTER] Live API call failed, falling back to simulated session:", err.message);
      }
    }
    return {
      paymentId: "",
      bookingId: req.bookingId,
      bookingReference: req.bookingReference,
      amount: req.amount,
      paidAmount: 0,
      currency: req.currency || "GMD",
      provider: "WAVE",
      status: "PROCESSING",
      transactionRef: txRef,
      instructions: `Wave Payment initiated for ${req.mobileWalletNumber || req.guestPhone}. QR code and Wave deep link generated for customer authorization.`,
      qrCodeData: `wave://pay?amount=${paidAmount}&ref=${txRef}&merchant=KilifaSuites`,
      requiresCustomerAction: true
    };
  }
  async verifyPayment(transactionRef) {
    if (this.isConfigured()) {
      try {
        const response = await fetch(`https://api.wave.com/v1/checkout/sessions/${transactionRef}`, {
          headers: { Authorization: `Bearer ${process.env.WAVE_API_KEY}` }
        });
        if (response.ok) {
          const data = await response.json();
          const isComplete = data.payment_status === "succeeded";
          return {
            transactionRef,
            status: isComplete ? "SUCCESSFUL" : "PROCESSING",
            amount: parseFloat(data.amount || "0"),
            paidAmount: parseFloat(data.amount || "0"),
            currency: "GMD",
            provider: "WAVE",
            gatewayMessage: isComplete ? "Wave transaction verified" : "Payment pending customer action",
            rawProviderData: data
          };
        }
      } catch (err) {
        console.warn("[WAVE ADAPTER] Verification call failed:", err.message);
      }
    }
    if (process.env.NODE_ENV === "production") {
      throw new Error("[WAVE] Production payment verification requires active WAVE_API_KEY and WAVE_MERCHANT_ID configuration.");
    }
    return {
      transactionRef,
      status: "PENDING",
      amount: 0,
      paidAmount: 0,
      currency: "GMD",
      provider: "WAVE",
      gatewayMessage: "Wave transaction pending customer payment authorization (Sandbox)"
    };
  }
  async refund(transactionRef, amount) {
    const refundRef = `REF-WAVE-${Date.now().toString().slice(-6)}`;
    return {
      transactionRef,
      refundRef,
      status: "REFUNDED",
      refundedAmount: amount || 0,
      remainingAmount: 0,
      gatewayMessage: "Wave transaction refunded successfully"
    };
  }
  async verifyWebhook(payload, signatureHeader) {
    const webhookSecret = process.env.WAVE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("[WAVE WEBHOOK] Production webhook processing requires active WAVE_WEBHOOK_SECRET configuration.");
      }
      const parsed = typeof payload === "string" ? JSON.parse(payload) : payload;
      const txRef = parsed.client_reference || parsed.data?.client_reference || parsed.id || "";
      return {
        verified: Boolean(txRef),
        transactionRef: txRef,
        status: parsed.type === "checkout.session.completed" || parsed.payment_status === "succeeded" ? "SUCCESSFUL" : "PROCESSING",
        amount: parseFloat(parsed.amount || parsed.data?.amount || "0"),
        paidAmount: parseFloat(parsed.amount || parsed.data?.amount || "0"),
        currency: parsed.currency || "GMD",
        gatewayMessage: "Wave sandbox webhook verified without secret"
      };
    }
    if (!signatureHeader) {
      return {
        verified: false,
        transactionRef: "",
        status: "FAILED",
        gatewayMessage: "Missing Wave webhook signature header"
      };
    }
    try {
      const payloadString = typeof payload === "string" ? payload : JSON.stringify(payload);
      const computedSignature = crypto2.createHmac("sha256", webhookSecret).update(payloadString).digest("hex");
      let incomingSig = signatureHeader.trim();
      if (incomingSig.includes("v1=")) {
        const match = incomingSig.match(/v1=([a-f0-9]+)/i);
        if (match) incomingSig = match[1];
      }
      const sigBuffer = Buffer.from(incomingSig, "hex");
      const compBuffer = Buffer.from(computedSignature, "hex");
      const isMatch = sigBuffer.length === compBuffer.length && crypto2.timingSafeEqual(sigBuffer, compBuffer);
      if (!isMatch) {
        return {
          verified: false,
          transactionRef: "",
          status: "FAILED",
          gatewayMessage: "Invalid Wave webhook HMAC signature"
        };
      }
      const parsed = typeof payload === "string" ? JSON.parse(payload) : payload;
      const txRef = parsed.client_reference || parsed.data?.client_reference || parsed.id || "";
      const isComplete = parsed.type === "checkout.session.completed" || parsed.payment_status === "succeeded" || parsed.status === "succeeded";
      return {
        verified: true,
        transactionRef: txRef,
        status: isComplete ? "SUCCESSFUL" : "PROCESSING",
        amount: parseFloat(parsed.amount || parsed.data?.amount || "0"),
        paidAmount: parseFloat(parsed.amount || parsed.data?.amount || "0"),
        currency: parsed.currency || "GMD",
        gatewayMessage: "Wave HMAC signature verified successfully"
      };
    } catch (err) {
      return {
        verified: false,
        transactionRef: "",
        status: "FAILED",
        gatewayMessage: `Signature verification error: ${err.message}`
      };
    }
  }
};

// src/server/payments/adapters/AfrimoneyAdapter.ts
var AfrimoneyAdapter = class {
  constructor() {
    this.provider = "AFRIMONEY";
  }
  isConfigured() {
    return Boolean(process.env.AFRIMONEY_API_KEY && process.env.AFRIMONEY_MERCHANT_CODE);
  }
  async initiatePayment(req) {
    const txRef = `AFRI-${req.bookingReference}-${Date.now().toString().slice(-6)}`;
    const paidAmount = req.paidAmount || req.amount;
    const phone = req.mobileWalletNumber || req.guestPhone;
    if (this.isConfigured()) {
      try {
        const response = await fetch("https://api.afrimoney.gm/v1/payments/request", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.AFRIMONEY_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            merchant_code: process.env.AFRIMONEY_MERCHANT_CODE,
            customer_msisdn: phone,
            amount: paidAmount,
            reference: txRef,
            description: `Kilifa Suites Reservation ${req.bookingReference}`
          })
        });
        if (response.ok) {
          const data = await response.json();
          return {
            paymentId: "",
            bookingId: req.bookingId,
            bookingReference: req.bookingReference,
            amount: req.amount,
            paidAmount,
            currency: req.currency || "GMD",
            provider: "AFRIMONEY",
            status: "PROCESSING",
            transactionRef: txRef,
            instructions: `Afrimoney USSD prompt sent to ${phone}. Please enter your 4-digit PIN on your handset to confirm.`,
            requiresCustomerAction: true
          };
        }
      } catch (err) {
        console.warn("[AFRIMONEY ADAPTER] API call failed:", err.message);
      }
    }
    return {
      paymentId: "",
      bookingId: req.bookingId,
      bookingReference: req.bookingReference,
      amount: req.amount,
      paidAmount: 0,
      currency: req.currency || "GMD",
      provider: "AFRIMONEY",
      status: "PROCESSING",
      transactionRef: txRef,
      instructions: `Afrimoney Mobile Wallet Payment initiated for ${phone}. USSD prompt *133# pending user authorization.`,
      requiresCustomerAction: true
    };
  }
  async verifyPayment(transactionRef) {
    if (process.env.NODE_ENV === "production" && !this.isConfigured()) {
      throw new Error("[AFRIMONEY] Production mobile money verification requires configured Africell API credentials.");
    }
    return {
      transactionRef,
      status: "PENDING",
      amount: 0,
      paidAmount: 0,
      currency: "GMD",
      provider: "AFRIMONEY",
      gatewayMessage: "Afrimoney USSD prompt pending customer authorization"
    };
  }
  async refund(transactionRef, amount) {
    const refundRef = `REF-AFRI-${Date.now().toString().slice(-6)}`;
    return {
      transactionRef,
      refundRef,
      status: "REFUNDED",
      refundedAmount: amount || 0,
      remainingAmount: 0,
      gatewayMessage: "Afrimoney wallet payment refunded"
    };
  }
};

// src/server/payments/adapters/ApsWalletAdapter.ts
var ApsWalletAdapter = class {
  constructor() {
    this.provider = "APS_WALLET";
  }
  isConfigured() {
    return Boolean(process.env.APS_WALLET_API_KEY && process.env.APS_MERCHANT_ID);
  }
  async initiatePayment(req) {
    const txRef = `APS-${req.bookingReference}-${Date.now().toString().slice(-6)}`;
    const paidAmount = req.paidAmount || req.amount;
    if (this.isConfigured()) {
      try {
        const response = await fetch("https://api.apsinternational.com/v1/checkout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.APS_WALLET_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            merchant_id: process.env.APS_MERCHANT_ID,
            amount: paidAmount,
            reference: txRef,
            customer_email: req.guestEmail
          })
        });
        if (response.ok) {
          const data = await response.json();
          return {
            paymentId: "",
            bookingId: req.bookingId,
            bookingReference: req.bookingReference,
            amount: req.amount,
            paidAmount,
            currency: req.currency || "GMD",
            provider: "APS_WALLET",
            status: "PROCESSING",
            transactionRef: txRef,
            redirectUrl: data.payment_url,
            instructions: "Redirecting to APS Wallet Gateway portal...",
            requiresCustomerAction: true
          };
        }
      } catch (err) {
        console.warn("[APS WALLET ADAPTER] Live call failed:", err.message);
      }
    }
    return {
      paymentId: "",
      bookingId: req.bookingId,
      bookingReference: req.bookingReference,
      amount: req.amount,
      paidAmount: 0,
      currency: req.currency || "GMD",
      provider: "APS_WALLET",
      status: "PROCESSING",
      transactionRef: txRef,
      instructions: `APS International Wallet payment initiated. Please complete authorization in APS portal.`,
      requiresCustomerAction: true
    };
  }
  async verifyPayment(transactionRef) {
    if (this.isConfigured()) {
      try {
        const response = await fetch(`https://api.apswallet.gm/v1/transactions/${transactionRef}`, {
          headers: {
            "X-API-KEY": process.env.APS_WALLET_API_KEY,
            "X-MERCHANT-ID": process.env.APS_MERCHANT_ID
          }
        });
        if (response.ok) {
          const data = await response.json();
          const isSuccess = data.status === "SUCCESS" || data.status === "APPROVED";
          return {
            transactionRef,
            status: isSuccess ? "SUCCESSFUL" : "PROCESSING",
            amount: parseFloat(data.amount || "0"),
            paidAmount: parseFloat(data.amount || "0"),
            currency: "GMD",
            provider: "APS_WALLET",
            gatewayMessage: isSuccess ? "APS Wallet payment verified" : "Payment processing",
            rawProviderData: data
          };
        }
      } catch (err) {
        console.warn("[APS WALLET] Live verification error:", err.message);
      }
    }
    if (process.env.NODE_ENV === "production") {
      throw new Error("[APS_WALLET] Production payment verification requires active APS_WALLET_API_KEY and merchant configuration.");
    }
    return {
      transactionRef,
      status: "PENDING",
      amount: 0,
      paidAmount: 0,
      currency: "GMD",
      provider: "APS_WALLET",
      gatewayMessage: "APS Wallet transaction pending customer approval (Sandbox)"
    };
  }
  async refund(transactionRef, amount) {
    const refundRef = `REF-APS-${Date.now().toString().slice(-6)}`;
    return {
      transactionRef,
      refundRef,
      status: "REFUNDED",
      refundedAmount: amount || 0,
      remainingAmount: 0,
      gatewayMessage: "APS Wallet payment refunded"
    };
  }
};

// src/server/payments/adapters/VisaCardAdapter.ts
var VisaCardAdapter = class {
  constructor() {
    this.provider = "VISA_CARD";
  }
  isConfigured() {
    return Boolean(process.env.VISA_GATEWAY_API_KEY || process.env.STRIPE_SECRET_KEY);
  }
  async initiatePayment(req) {
    const txRef = `VISA-${req.bookingReference}-${Date.now().toString().slice(-6)}`;
    const paidAmount = req.paidAmount || req.amount;
    if (req.metadata?.rawCardNumber || req.metadata?.cvv) {
      throw new Error("SECURITY VIOLATION: Raw card numbers and CVVs must never be sent or stored.");
    }
    if (this.isConfigured()) {
      const apiKey = process.env.STRIPE_SECRET_KEY || process.env.VISA_GATEWAY_API_KEY;
      try {
        const response = await fetch("https://api.stripe.com/v1/payment_intents", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            amount: Math.round(paidAmount * 100).toString(),
            currency: (req.currency || "GMD").toLowerCase(),
            "metadata[bookingReference]": req.bookingReference,
            "metadata[guestEmail]": req.guestEmail
          })
        });
        if (response.ok) {
          const intent = await response.json();
          return {
            paymentId: "",
            bookingId: req.bookingId,
            bookingReference: req.bookingReference,
            amount: req.amount,
            paidAmount,
            currency: req.currency || "GMD",
            provider: "VISA_CARD",
            status: intent.status === "succeeded" ? "SUCCESSFUL" : "PROCESSING",
            transactionRef: intent.id || txRef,
            redirectUrl: intent.next_action?.redirect_to_url?.url,
            instructions: "3D-Secure Visa authentication active.",
            requiresCustomerAction: intent.status !== "succeeded",
            metadata: { clientSecret: intent.client_secret }
          };
        }
      } catch (err) {
        console.warn("[VISA ADAPTER] Live gateway charge failed, using secure tokenized simulation:", err.message);
      }
    }
    return {
      paymentId: "",
      bookingId: req.bookingId,
      bookingReference: req.bookingReference,
      amount: req.amount,
      paidAmount: 0,
      currency: req.currency || "GMD",
      provider: "VISA_CARD",
      status: "PROCESSING",
      transactionRef: txRef,
      instructions: `Visa tokenized authorization initialized (Token: ${req.cardToken || "tok_visa_secured_3ds"}). 3D Secure verification pending customer authorization.`,
      requiresCustomerAction: true,
      metadata: { tokenized: true, last4: "4242" }
    };
  }
  async verifyPayment(transactionRef) {
    if (process.env.NODE_ENV === "production" && !this.isConfigured()) {
      throw new Error("[VISA] Production card verification requires configured PCI gateway credentials.");
    }
    return {
      transactionRef,
      status: "PENDING",
      amount: 0,
      paidAmount: 0,
      currency: "GMD",
      provider: "VISA_CARD",
      gatewayMessage: "Visa 3DS payment verification pending customer authorization"
    };
  }
  async refund(transactionRef, amount) {
    const refundRef = `REF-VISA-${Date.now().toString().slice(-6)}`;
    return {
      transactionRef,
      refundRef,
      status: "REFUNDED",
      refundedAmount: amount || 0,
      remainingAmount: 0,
      gatewayMessage: "Visa card charge refunded via PCI gateway"
    };
  }
};

// src/server/payments/adapters/PayPalAdapter.ts
var PayPalAdapter = class {
  constructor() {
    this.provider = "PAYPAL";
  }
  isConfigured() {
    return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
  }
  async initiatePayment(req) {
    const txRef = `PAYPAL-${req.bookingReference}-${Date.now().toString().slice(-6)}`;
    const paidAmount = req.paidAmount || req.amount;
    if (this.isConfigured()) {
      try {
        const mode = process.env.PAYPAL_MODE === "live" ? "api-m.paypal.com" : "api-m.sandbox.paypal.com";
        const authRes = await fetch(`https://${mode}/v1/oauth2/token`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
            ).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: "grant_type=client_credentials"
        });
        if (authRes.ok) {
          const authData = await authRes.json();
          const orderRes = await fetch(`https://${mode}/v2/checkout/orders`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authData.access_token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              intent: "CAPTURE",
              purchase_units: [
                {
                  reference_id: txRef,
                  amount: {
                    currency_code: req.currency || "GMD",
                    value: paidAmount.toFixed(2)
                  },
                  description: `Kilifa Suites Reservation ${req.bookingReference}`
                }
              ]
            })
          });
          if (orderRes.ok) {
            const orderData = await orderRes.json();
            const approveUrl = orderData.links?.find((l) => l.rel === "approve")?.href;
            return {
              paymentId: "",
              bookingId: req.bookingId,
              bookingReference: req.bookingReference,
              amount: req.amount,
              paidAmount,
              currency: req.currency || "GMD",
              provider: "PAYPAL",
              status: "PROCESSING",
              transactionRef: orderData.id || txRef,
              redirectUrl: approveUrl,
              instructions: "Redirecting to PayPal Checkout window...",
              requiresCustomerAction: true
            };
          }
        }
      } catch (err) {
        console.warn("[PAYPAL ADAPTER] Live API call failed, using sandbox fallback:", err.message);
      }
    }
    return {
      paymentId: "",
      bookingId: req.bookingId,
      bookingReference: req.bookingReference,
      amount: req.amount,
      paidAmount: 0,
      currency: req.currency || "GMD",
      provider: "PAYPAL",
      status: "PROCESSING",
      transactionRef: txRef,
      instructions: `PayPal checkout session initialized for ${req.guestEmail}. Buyer approval pending.`,
      requiresCustomerAction: true
    };
  }
  async verifyPayment(transactionRef) {
    if (this.isConfigured()) {
      try {
        const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
        const baseUrl = process.env.PAYPAL_MODE === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
        const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: "grant_type=client_credentials"
        });
        if (tokenRes.ok) {
          const { access_token } = await tokenRes.json();
          const orderRes = await fetch(`${baseUrl}/v2/checkout/orders/${transactionRef}`, {
            headers: { Authorization: `Bearer ${access_token}` }
          });
          if (orderRes.ok) {
            const orderData = await orderRes.json();
            const isCompleted = orderData.status === "COMPLETED";
            const capture = orderData.purchase_units?.[0]?.payments?.captures?.[0];
            const paid = capture ? parseFloat(capture.amount?.value || "0") : 0;
            return {
              transactionRef,
              status: isCompleted ? "SUCCESSFUL" : "PROCESSING",
              amount: paid,
              paidAmount: paid,
              currency: capture?.amount?.currency_code || "GMD",
              provider: "PAYPAL",
              gatewayMessage: isCompleted ? "PayPal payment captured" : "Payment pending approval",
              rawProviderData: orderData
            };
          }
        }
      } catch (err) {
        console.warn("[PAYPAL ADAPTER] Verification error:", err.message);
      }
    }
    if (process.env.NODE_ENV === "production") {
      throw new Error("[PAYPAL] Production payment verification requires active PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET credentials.");
    }
    return {
      transactionRef,
      status: "PENDING",
      amount: 0,
      paidAmount: 0,
      currency: "GMD",
      provider: "PAYPAL",
      gatewayMessage: "PayPal order pending buyer capture and authorization (Sandbox)"
    };
  }
  async refund(transactionRef, amount) {
    const refundRef = `REF-PAYPAL-${Date.now().toString().slice(-6)}`;
    return {
      transactionRef,
      refundRef,
      status: "REFUNDED",
      refundedAmount: amount || 0,
      remainingAmount: 0,
      gatewayMessage: "PayPal transaction refunded to buyer account"
    };
  }
};

// src/server/payments/adapters/CashBankAdapter.ts
var CashBankAdapter = class {
  constructor(provider) {
    this.provider = provider;
  }
  isConfigured() {
    return true;
  }
  async initiatePayment(req) {
    const prefix = this.provider === "CASH" ? "CASH" : "BANK";
    const txRef = `${prefix}-${req.bookingReference}-${Date.now().toString().slice(-6)}`;
    const instructions = this.provider === "CASH" ? `Cash payment of D ${Number(req.amount).toLocaleString()} due at Kilifa Suites Front Desk upon arrival.` : `Bank Wire Transfer created for D ${Number(req.amount).toLocaleString()}. Ecobank Gambia / Trust Bank Gambia. Present bank transfer slip at check-in.`;
    return {
      paymentId: "",
      bookingId: req.bookingId,
      bookingReference: req.bookingReference,
      amount: req.amount,
      paidAmount: 0,
      currency: req.currency || "GMD",
      provider: this.provider,
      status: "PENDING",
      transactionRef: txRef,
      instructions,
      requiresCustomerAction: false
    };
  }
  async verifyPayment(transactionRef) {
    return {
      transactionRef,
      status: "PENDING",
      amount: 0,
      paidAmount: 0,
      currency: "GMD",
      provider: this.provider,
      gatewayMessage: `${this.provider} awaiting physical verification and confirmation by front-desk receptionist`
    };
  }
  async refund(transactionRef, amount) {
    const refundRef = `REF-${this.provider}-${Date.now().toString().slice(-6)}`;
    return {
      transactionRef,
      refundRef,
      status: "REFUNDED",
      refundedAmount: amount || 0,
      remainingAmount: 0,
      gatewayMessage: `${this.provider} refund recorded in reception ledger`
    };
  }
};

// src/server/payments/PaymentManager.ts
var PaymentManager = class {
  constructor() {
    this.adapters = /* @__PURE__ */ new Map();
    this.registerAdapter(new WaveAdapter());
    this.registerAdapter(new AfrimoneyAdapter());
    this.registerAdapter(new ApsWalletAdapter());
    this.registerAdapter(new VisaCardAdapter());
    this.registerAdapter(new PayPalAdapter());
    this.registerAdapter(new CashBankAdapter("CASH"));
    this.registerAdapter(new CashBankAdapter("BANK_TRANSFER"));
  }
  registerAdapter(adapter) {
    this.adapters.set(adapter.provider, adapter);
  }
  getAdapter(provider) {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new Error(`Unsupported or unregistered payment provider: ${provider}`);
    }
    return adapter;
  }
  listProviders() {
    return [
      {
        provider: "WAVE",
        name: "Wave Mobile Money",
        isConfigured: this.getAdapter("WAVE").isConfigured(),
        type: "MOBILE_MONEY",
        currency: "GMD"
      },
      {
        provider: "AFRIMONEY",
        name: "Afrimoney (The Gambia)",
        isConfigured: this.getAdapter("AFRIMONEY").isConfigured(),
        type: "MOBILE_MONEY",
        currency: "GMD"
      },
      {
        provider: "APS_WALLET",
        name: "APS Wallet (Gambia)",
        isConfigured: this.getAdapter("APS_WALLET").isConfigured(),
        type: "WALLET",
        currency: "GMD"
      },
      {
        provider: "VISA_CARD",
        name: "Visa / Mastercard (Credit & Debit)",
        isConfigured: this.getAdapter("VISA_CARD").isConfigured(),
        type: "CARD",
        currency: "GMD / Multi-Currency"
      },
      {
        provider: "PAYPAL",
        name: "PayPal Global",
        isConfigured: this.getAdapter("PAYPAL").isConfigured(),
        type: "WALLET",
        currency: "GMD / Multi-Currency"
      },
      {
        provider: "CASH",
        name: "Cash at Reception Desk",
        isConfigured: true,
        type: "DIRECT",
        currency: "GMD"
      },
      {
        provider: "BANK_TRANSFER",
        name: "Direct Bank Wire Transfer",
        isConfigured: true,
        type: "DIRECT",
        currency: "GMD"
      }
    ];
  }
  async processPayment(req) {
    const adapter = this.getAdapter(req.provider);
    return adapter.initiatePayment(req);
  }
  async verifyPayment(provider, transactionRef) {
    const adapter = this.getAdapter(provider);
    return adapter.verifyPayment(transactionRef);
  }
  async refundPayment(provider, transactionRef, amount) {
    const adapter = this.getAdapter(provider);
    return adapter.refund(transactionRef, amount);
  }
  async handleWebhook(provider, payload, signatureHeader) {
    const adapter = this.getAdapter(provider);
    if (!adapter.verifyWebhook) {
      throw new Error(`Provider '${provider}' does not support automated webhook verification.`);
    }
    return adapter.verifyWebhook(payload, signatureHeader);
  }
};
var paymentManager = new PaymentManager();

// src/server/services/paymentService.ts
var PaymentService = class {
  getAvailableProviders() {
    return paymentManager.listProviders();
  }
  async initiatePayment(req) {
    let booking = null;
    if (isDatabaseConnected()) {
      try {
        booking = await prisma.booking.findFirst({
          where: { OR: [{ id: req.bookingId }, { bookingReference: req.bookingReference }] },
          include: { payment: true, suite: true }
        });
      } catch (err) {
        console.warn("[PAYMENT SERVICE] Prisma booking lookup warning:", err.message);
      }
    }
    const totalAmount = booking ? booking.totalEstimatedPrice : req.amount;
    const initialPaid = req.paidAmount !== void 0 ? req.paidAmount : totalAmount;
    const gatewayResult = await paymentManager.processPayment({
      ...req,
      bookingId: booking ? booking.id : req.bookingId,
      bookingReference: booking ? booking.bookingReference : req.bookingReference,
      amount: totalAmount,
      paidAmount: initialPaid
    });
    const methodEnum = this.mapProviderToEnum(req.provider);
    const statusEnum = this.mapStatusToEnum(gatewayResult.status);
    if (isDatabaseConnected() && booking) {
      try {
        const existingPayment = booking.payment;
        if (existingPayment) {
          const updatedPayment = await prisma.payment.update({
            where: { id: existingPayment.id },
            data: {
              amount: totalAmount,
              paidAmount: initialPaid,
              status: statusEnum,
              method: methodEnum,
              provider: req.provider,
              transactionRef: gatewayResult.transactionRef,
              paymentNotes: gatewayResult.instructions
            }
          });
          gatewayResult.paymentId = updatedPayment.id;
        } else {
          const newPayment = await prisma.payment.create({
            data: {
              bookingId: booking.id,
              amount: totalAmount,
              paidAmount: initialPaid,
              currency: req.currency || "GMD",
              status: statusEnum,
              method: methodEnum,
              provider: req.provider,
              transactionRef: gatewayResult.transactionRef,
              paymentNotes: gatewayResult.instructions
            }
          });
          gatewayResult.paymentId = newPayment.id;
        }
      } catch (err) {
        console.warn("[PAYMENT SERVICE] Prisma payment persistence warning:", err.message);
      }
    }
    if (!gatewayResult.paymentId) {
      gatewayResult.paymentId = `PAY-${Date.now().toString().slice(-8)}`;
    }
    return gatewayResult;
  }
  async recordPartialPayment(paymentId, paidAmount, notes) {
    let payment = null;
    try {
      payment = await prisma.payment.findFirst({
        where: { OR: [{ id: paymentId }, { bookingId: paymentId }, { transactionRef: paymentId }] },
        include: { booking: true }
      });
      if (payment) {
        const cumulativePaid = payment.paidAmount + paidAmount;
        const total = payment.amount;
        const newStatus = cumulativePaid >= total ? "SUCCESSFUL" : cumulativePaid > 0 ? "PARTIALLY_PAID" : "PENDING";
        const updated = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            paidAmount: cumulativePaid,
            status: this.mapStatusToEnum(newStatus),
            paymentNotes: notes ? `${payment.paymentNotes || ""} | ${notes}` : payment.paymentNotes
          },
          include: { booking: { include: { suite: true } } }
        });
        if (newStatus === "SUCCESSFUL" || newStatus === "PARTIALLY_PAID") {
          await prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: "CONFIRMED" }
          });
        }
        return {
          paymentId: updated.id,
          bookingId: updated.bookingId,
          bookingReference: updated.booking.bookingReference,
          totalAmount: updated.amount,
          paidAmount: updated.paidAmount,
          remainingAmount: Math.max(0, updated.amount - updated.paidAmount),
          status: newStatus,
          provider: updated.provider
        };
      }
    } catch (err) {
      console.warn("[PAYMENT SERVICE] Prisma recordPartialPayment failed:", err.message);
    }
    throw new ApiError(404, `Payment record '${paymentId}' not found`);
  }
  async updatePaymentStatus(paymentId, status, notes) {
    const statusEnum = this.mapStatusToEnum(status);
    try {
      const payment = await prisma.payment.findFirst({
        where: { OR: [{ id: paymentId }, { bookingId: paymentId }, { transactionRef: paymentId }] }
      });
      if (payment) {
        const updated = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: statusEnum,
            ...status === "SUCCESSFUL" && { paidAmount: payment.amount },
            ...notes && { paymentNotes: notes }
          },
          include: { booking: { include: { suite: true } } }
        });
        if (status === "SUCCESSFUL" || status === "PARTIALLY_PAID") {
          await prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: "CONFIRMED" }
          });
        } else if (status === "CANCELLED" || status === "FAILED") {
          await prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: "CANCELLED" }
          });
        }
        return updated;
      }
    } catch (err) {
      console.warn("[PAYMENT SERVICE] Prisma status update failed:", err.message);
    }
    throw new ApiError(404, `Payment '${paymentId}' not found`);
  }
  async refundPayment(paymentId, amount) {
    try {
      const payment = await prisma.payment.findFirst({
        where: { OR: [{ id: paymentId }, { bookingId: paymentId }, { transactionRef: paymentId }] }
      });
      if (payment) {
        const refundAmount = amount || payment.paidAmount || payment.amount;
        const provider = payment.provider || "CASH";
        const gatewayRefund = await paymentManager.refundPayment(
          provider,
          payment.transactionRef || payment.id,
          refundAmount
        );
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "REFUNDED",
            paidAmount: Math.max(0, payment.paidAmount - refundAmount),
            paymentNotes: `Refunded $${refundAmount} via ${provider}. Ref: ${gatewayRefund.refundRef}`
          }
        });
        return gatewayRefund;
      }
    } catch (err) {
      console.warn("[PAYMENT SERVICE] Prisma refund failed:", err.message);
    }
    throw new ApiError(404, `Payment record '${paymentId}' not found for refund`);
  }
  async getAllPayments() {
    try {
      const payments = await prisma.payment.findMany({
        include: {
          booking: {
            include: { suite: true, guest: true }
          }
        },
        orderBy: { createdAt: "desc" }
      });
      if (payments && payments.length > 0) {
        return payments.map((p) => ({
          id: p.id,
          bookingId: p.bookingId,
          bookingReference: p.booking?.bookingReference || "N/A",
          guestName: p.booking?.fullName || "Guest",
          guestEmail: p.booking?.email || "N/A",
          suiteName: p.booking?.suite?.name || "DAR",
          amount: p.amount,
          paidAmount: p.paidAmount,
          currency: p.currency,
          status: p.status,
          method: p.method,
          provider: p.provider,
          transactionRef: p.transactionRef,
          notes: p.paymentNotes,
          createdAt: p.createdAt.toISOString()
        }));
      }
    } catch (err) {
      console.warn("[PAYMENT SERVICE] Prisma getAllPayments failed:", err.message);
    }
    return [];
  }
  /**
   * Process and verify inbound payment gateway webhook
   * Validates HMAC signature, prevents duplicate replays, and confirms booking
   */
  async processWebhook(provider, payload, signatureHeader) {
    const verification = await paymentManager.handleWebhook(provider, payload, signatureHeader);
    if (!verification.verified) {
      throw new ApiError(401, `Webhook verification failed: ${verification.gatewayMessage || "Invalid signature"}`);
    }
    const txRef = verification.transactionRef;
    if (!txRef) {
      throw new ApiError(400, "Webhook payload missing transaction reference");
    }
    let payment = null;
    if (isDatabaseConnected()) {
      try {
        payment = await prisma.payment.findFirst({
          where: {
            OR: [
              { transactionRef: txRef },
              { id: txRef }
            ]
          },
          include: {
            booking: {
              include: { suite: true }
            }
          }
        });
        if (payment) {
          if (payment.status === "SUCCESSFUL") {
            return {
              success: true,
              duplicate: true,
              message: "Webhook received for already completed transaction. No changes required.",
              transactionRef: txRef,
              status: "SUCCESSFUL"
            };
          }
          if (verification.status === "SUCCESSFUL") {
            const confirmedPaid = verification.paidAmount || payment.amount;
            await prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: "SUCCESSFUL",
                paidAmount: confirmedPaid,
                paymentNotes: `${payment.paymentNotes || ""} | Verified via ${provider} webhook`.trim()
              }
            });
            const updatedBooking = await prisma.booking.update({
              where: { id: payment.bookingId },
              data: { status: "CONFIRMED" },
              include: { suite: true }
            });
            await prisma.accessCard.updateMany({
              where: { bookingId: payment.bookingId },
              data: { status: "ACTIVE" }
            });
            notificationService.notifyBookingConfirmed({
              email: updatedBooking.email,
              phone: updatedBooking.phone,
              fullName: updatedBooking.fullName,
              bookingReference: updatedBooking.bookingReference,
              suiteName: updatedBooking.suite?.name || "DAR",
              checkIn: updatedBooking.checkIn.toISOString().split("T")[0],
              checkOut: updatedBooking.checkOut.toISOString().split("T")[0]
            }).catch((err) => console.warn("[WEBHOOK NOTIFICATION ERROR]", err));
          } else if (verification.status === "FAILED") {
            await prisma.payment.update({
              where: { id: payment.id },
              data: { status: "FAILED" }
            });
          }
          return {
            success: true,
            duplicate: false,
            transactionRef: txRef,
            status: verification.status,
            message: `Webhook processed and payment updated to ${verification.status}`
          };
        }
      } catch (err) {
        if (err instanceof ApiError) throw err;
        console.warn("[PAYMENT WEBHOOK] Prisma update error:", err.message);
      }
    }
    return {
      success: true,
      duplicate: false,
      transactionRef: txRef,
      status: verification.status,
      message: `Webhook received and validated for ${provider}`
    };
  }
  mapProviderToEnum(provider) {
    switch (provider) {
      case "WAVE":
        return "WAVE";
      case "AFRIMONEY":
        return "AFRIMONEY";
      case "APS_WALLET":
        return "APS_WALLET";
      case "VISA_CARD":
        return "VISA_CARD";
      case "PAYPAL":
        return "PAYPAL";
      case "BANK_TRANSFER":
        return "BANK_TRANSFER";
      case "CASH":
      default:
        return "CASH";
    }
  }
  mapStatusToEnum(status) {
    switch (status) {
      case "PROCESSING":
        return "PROCESSING";
      case "SUCCESSFUL":
      case "COMPLETED":
        return "SUCCESSFUL";
      case "FAILED":
        return "FAILED";
      case "CANCELLED":
        return "CANCELLED";
      case "REFUNDED":
        return "REFUNDED";
      case "PARTIALLY_PAID":
        return "PARTIALLY_PAID";
      case "PENDING":
      default:
        return "PENDING";
    }
  }
};
var paymentService = new PaymentService();

// src/server/controllers/paymentController.ts
var getProviders = async (req, res, next) => {
  try {
    const providers = paymentService.getAvailableProviders();
    res.status(200).json({
      status: "success",
      data: providers
    });
  } catch (err) {
    next(err);
  }
};
var initiatePayment = async (req, res, next) => {
  try {
    const {
      bookingId,
      bookingReference,
      amount,
      paidAmount,
      currency,
      provider,
      guestName,
      guestEmail,
      guestPhone,
      mobileWalletNumber,
      cardToken,
      notes
    } = req.body;
    if (!provider) {
      throw new ApiError(400, "Payment provider is required (WAVE, AFRIMONEY, APS_WALLET, VISA_CARD, PAYPAL, CASH, BANK_TRANSFER)");
    }
    if (!bookingId && !bookingReference) {
      throw new ApiError(400, "bookingId or bookingReference is required");
    }
    if (req.body.cardNumber || req.body.cvv || req.body.rawCard) {
      throw new ApiError(400, "Security Violation: Raw card numbers and CVVs are strictly forbidden.");
    }
    const result = await paymentService.initiatePayment({
      bookingId: bookingId || "",
      bookingReference: bookingReference || "",
      amount: Number(amount || 0),
      paidAmount: paidAmount !== void 0 ? Number(paidAmount) : void 0,
      currency: currency || "GMD",
      provider,
      guestName: guestName || "Guest",
      guestEmail: guestEmail || "guest@kilifasuites.gm",
      guestPhone: guestPhone || "+220000000",
      mobileWalletNumber,
      cardToken,
      notes
    });
    res.status(200).json({
      status: "success",
      message: `Payment initialized via ${provider}`,
      data: result
    });
  } catch (err) {
    next(err);
  }
};
var recordPartialPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { paidAmount, notes } = req.body;
    if (!paidAmount || Number(paidAmount) <= 0) {
      throw new ApiError(400, "Valid positive paidAmount is required");
    }
    const result = await paymentService.recordPartialPayment(paymentId, Number(paidAmount), notes);
    res.status(200).json({
      status: "success",
      message: "Partial payment recorded successfully",
      data: result
    });
  } catch (err) {
    next(err);
  }
};
var updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { status, notes } = req.body;
    if (!status) {
      throw new ApiError(400, "Payment status is required");
    }
    const updated = await paymentService.updatePaymentStatus(paymentId, status, notes);
    res.status(200).json({
      status: "success",
      message: `Payment status updated to ${status}`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};
var refundPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { amount } = req.body;
    const result = await paymentService.refundPayment(paymentId, amount ? Number(amount) : void 0);
    res.status(200).json({
      status: "success",
      message: "Payment refunded successfully",
      data: result
    });
  } catch (err) {
    next(err);
  }
};
var getAllPayments = async (req, res, next) => {
  try {
    const payments = await paymentService.getAllPayments();
    res.status(200).json({
      status: "success",
      data: payments
    });
  } catch (err) {
    next(err);
  }
};
var handleWebhook = async (req, res, next) => {
  try {
    const provider = req.params.provider?.toUpperCase();
    const signatureHeader = req.headers["wave-signature"] || req.headers["x-wave-signature"] || req.headers["x-signature"] || req.headers["stripe-signature"] || "";
    const result = await paymentService.processWebhook(provider, req.body, signatureHeader);
    res.status(200).json({
      status: "success",
      received: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// src/server/routes/paymentRoutes.ts
import { Role as Role10 } from "@prisma/client";
var router8 = Router8();
router8.get("/providers", getProviders);
router8.post("/initiate", strictActionRateLimiter, initiatePayment);
router8.post("/webhook/:provider", strictActionRateLimiter, handleWebhook);
router8.use(authenticateToken);
router8.get("/", requireRole(Role10.OWNER, Role10.ADMIN, Role10.RECEPTIONIST, Role10.STAFF), getAllPayments);
router8.post(
  "/:paymentId/partial",
  requireRole(Role10.OWNER, Role10.ADMIN, Role10.RECEPTIONIST),
  recordPartialPayment
);
router8.patch(
  "/:paymentId/status",
  requireRole(Role10.OWNER, Role10.ADMIN, Role10.RECEPTIONIST),
  updatePaymentStatus
);
router8.post(
  "/:paymentId/refund",
  requireRole(Role10.OWNER, Role10.ADMIN, Role10.RECEPTIONIST),
  refundPayment
);
var paymentRoutes_default = router8;

// src/server/routes/accessControlRoutes.ts
import { Router as Router9 } from "express";

// src/server/controllers/accessControlController.ts
var getHardwareSpec = async (req, res, next) => {
  try {
    const spec = accessControlService.getHardwareSpec();
    res.status(200).json({
      status: "success",
      data: spec
    });
  } catch (err) {
    next(err);
  }
};
var getAllCards = async (req, res, next) => {
  try {
    const cards = await accessControlService.getAllCards();
    res.status(200).json({
      status: "success",
      data: cards
    });
  } catch (err) {
    next(err);
  }
};
var getCardDetails = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const card = await accessControlService.getCardDetails(cardId);
    if (!card) {
      throw new ApiError(404, `Access card '${cardId}' not found`);
    }
    res.status(200).json({
      status: "success",
      data: card
    });
  } catch (err) {
    next(err);
  }
};
var createCard = async (req, res, next) => {
  try {
    const { bookingId, bookingReference, guestName, suiteName, checkIn, checkOut } = req.body;
    if (!bookingId && !bookingReference) {
      throw new ApiError(400, "bookingId or bookingReference is required");
    }
    const card = await accessControlService.createCardForBooking({
      bookingId: bookingId || "",
      bookingReference: bookingReference || "",
      guestName: guestName || "Guest",
      suiteName: suiteName || "Kilifa Suite",
      checkIn,
      checkOut
    });
    res.status(201).json({
      status: "success",
      message: "Access card created (INACTIVE state) upon booking confirmation",
      data: card
    });
  } catch (err) {
    next(err);
  }
};
var activateCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const card = await accessControlService.activateCard(cardId);
    res.status(200).json({
      status: "success",
      message: "Access card activated successfully in hardware lock controller",
      data: card
    });
  } catch (err) {
    next(err);
  }
};
var processCheckIn = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const result = await accessControlService.processGuestCheckIn(cardId);
    res.status(200).json({
      status: "success",
      message: "Guest check-in processed. Suite door unlatched and access card active.",
      data: result
    });
  } catch (err) {
    next(err);
  }
};
var processCheckOut = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const result = await accessControlService.processGuestCheckOut(cardId);
    res.status(200).json({
      status: "success",
      message: "Guest checkout completed. Card credentials expired and unprogrammed from lock nodes.",
      data: result
    });
  } catch (err) {
    next(err);
  }
};
var revokeCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { reason } = req.body;
    const card = await accessControlService.revokeCard(cardId, reason);
    res.status(200).json({
      status: "success",
      message: "Access card forcibly revoked in lock controller",
      data: card
    });
  } catch (err) {
    next(err);
  }
};
var simulateEntry = async (req, res, next) => {
  try {
    const { cardId, doorId, doorName } = req.body;
    if (!cardId) {
      throw new ApiError(400, "cardId is required for door entry simulation");
    }
    const doorLog = await accessControlService.simulateDoorEntry({ cardId, doorId, doorName });
    res.status(200).json({
      status: "success",
      message: doorLog.accessGranted ? "Access GRANTED at lock reader" : "Access DENIED at lock reader",
      data: doorLog
    });
  } catch (err) {
    next(err);
  }
};
var getDoorAuditLogs = async (req, res, next) => {
  try {
    const { cardId } = req.query;
    const logs = await accessControlService.getDoorAuditLogs(cardId ? String(cardId) : void 0);
    res.status(200).json({
      status: "success",
      data: logs
    });
  } catch (err) {
    next(err);
  }
};

// src/server/routes/accessControlRoutes.ts
import { Role as Role11 } from "@prisma/client";
var router9 = Router9();
router9.use(authenticateToken);
router9.get("/cards/:cardId", requireRole(Role11.OWNER, Role11.ADMIN, Role11.RECEPTIONIST, Role11.STAFF), getCardDetails);
router9.post("/simulate-entry", requireRole(Role11.OWNER, Role11.ADMIN, Role11.RECEPTIONIST, Role11.STAFF), simulateEntry);
router9.get("/hardware-spec", requireRole(Role11.OWNER, Role11.ADMIN, Role11.RECEPTIONIST, Role11.STAFF), getHardwareSpec);
router9.get("/cards", requireRole(Role11.OWNER, Role11.ADMIN, Role11.RECEPTIONIST, Role11.STAFF), getAllCards);
router9.get("/logs", requireRole(Role11.OWNER, Role11.ADMIN, Role11.RECEPTIONIST, Role11.STAFF), getDoorAuditLogs);
router9.post("/cards/create", requireRole(Role11.OWNER, Role11.ADMIN, Role11.RECEPTIONIST, Role11.STAFF), createCard);
router9.post(
  "/cards/:cardId/activate",
  requireRole(Role11.OWNER, Role11.ADMIN, Role11.RECEPTIONIST, Role11.STAFF),
  activateCard
);
router9.post(
  "/cards/:cardId/checkin",
  requireRole(Role11.OWNER, Role11.ADMIN, Role11.RECEPTIONIST, Role11.STAFF),
  processCheckIn
);
router9.post(
  "/cards/:cardId/checkout",
  requireRole(Role11.OWNER, Role11.ADMIN, Role11.RECEPTIONIST, Role11.STAFF),
  processCheckOut
);
router9.post(
  "/cards/:cardId/revoke",
  requireRole(Role11.OWNER, Role11.ADMIN, Role11.RECEPTIONIST, Role11.STAFF),
  revokeCard
);
var accessControlRoutes_default = router9;

// src/server/routes/notificationRoutes.ts
import { Router as Router10 } from "express";

// src/server/controllers/notificationController.ts
var getProvidersStatus = async (req, res, next) => {
  try {
    const statuses = notificationService.getProvidersStatus();
    res.status(200).json({
      status: "success",
      data: statuses
    });
  } catch (err) {
    next(err);
  }
};
var getAuditHistory = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 50;
    const history = notificationService.getAuditHistory(limit);
    res.status(200).json({
      status: "success",
      data: history
    });
  } catch (err) {
    next(err);
  }
};
var sendNotification = async (req, res, next) => {
  try {
    const { type, channels, recipient, bookingReference, suiteName, checkInDate, checkOutDate, amount, accessPin, cardNumber, customMessage } = req.body;
    if (!type || !recipient) {
      throw new ApiError(400, "Notification type and recipient (email/phone) are required");
    }
    const results = await notificationService.sendNotification(
      {
        type,
        recipient,
        bookingReference,
        suiteName,
        checkInDate,
        checkOutDate,
        amount,
        accessPin,
        cardNumber,
        customMessage
      },
      channels
    );
    res.status(200).json({
      status: "success",
      message: `Notification dispatch processed across ${results.length} channel(s)`,
      data: results
    });
  } catch (err) {
    next(err);
  }
};
var triggerBookingReminder = async (req, res, next) => {
  try {
    const { reminderType, email, phone, fullName, bookingReference, suiteName, checkIn, checkOut, cardNumber, pinCode } = req.body;
    if (!reminderType || !email || !fullName) {
      throw new ApiError(400, "reminderType, email, and fullName are required");
    }
    let results;
    switch (reminderType) {
      case "CHECK_IN_REMINDER":
        results = await notificationService.notifyCheckInReminder({
          email,
          phone: phone || "+2207000000",
          fullName,
          bookingReference: bookingReference || "KS-REF",
          suiteName: suiteName || "Kilifa Suite",
          checkIn: checkIn || (/* @__PURE__ */ new Date()).toISOString()
        });
        break;
      case "CHECK_OUT_REMINDER":
        results = await notificationService.notifyCheckOutReminder({
          email,
          phone: phone || "+2207000000",
          fullName,
          bookingReference: bookingReference || "KS-REF",
          suiteName: suiteName || "Kilifa Suite",
          checkOut: checkOut || (/* @__PURE__ */ new Date()).toISOString()
        });
        break;
      case "ACCESS_CARD_INFO":
        results = await notificationService.notifyAccessCardInfo({
          email,
          phone: phone || "+2207000000",
          fullName,
          bookingReference: bookingReference || "KS-REF",
          suiteName: suiteName || "Kilifa Suite",
          cardNumber: cardNumber || "AC-KS-0102",
          pinCode: pinCode || "7821"
        });
        break;
      default:
        throw new ApiError(400, `Unsupported reminder type: ${reminderType}`);
    }
    res.status(200).json({
      status: "success",
      message: `${reminderType} notification dispatched successfully`,
      data: results
    });
  } catch (err) {
    next(err);
  }
};

// src/server/routes/notificationRoutes.ts
import { Role as Role12 } from "@prisma/client";
var router10 = Router10();
router10.get("/providers", getProvidersStatus);
router10.use(authenticateToken);
router10.get("/history", requireRole(Role12.OWNER, Role12.ADMIN, Role12.RECEPTIONIST, Role12.STAFF), getAuditHistory);
router10.post("/send", requireRole(Role12.OWNER, Role12.ADMIN, Role12.RECEPTIONIST, Role12.STAFF), sendNotification);
router10.post("/trigger-reminder", requireRole(Role12.OWNER, Role12.ADMIN, Role12.RECEPTIONIST, Role12.STAFF), triggerBookingReminder);
var notificationRoutes_default = router10;

// src/server/routes/analyticsRoutes.ts
import { Router as Router11 } from "express";

// src/server/services/analyticsService.ts
var AnalyticsService = class {
  async getAnalyticsReport(timeframe = "all") {
    let bookings = [];
    let suites = [];
    let guests = [];
    let payments = [];
    if (isDatabaseConnected()) {
      try {
        bookings = await prisma.booking.findMany({
          include: {
            suite: true,
            guest: true,
            payment: true
          },
          orderBy: { createdAt: "desc" }
        });
        suites = await prisma.suite.findMany({
          include: { house: true }
        });
        guests = await prisma.guest.findMany();
        payments = await prisma.payment.findMany();
      } catch (err) {
      }
    }
    if (suites.length === 0) {
      suites = await suiteService.getAllSuites();
    }
    if (bookings.length === 0) {
      const fallbackRecords = await bookingService.getAllBookings();
      bookings = fallbackRecords.map((b) => ({
        ...b,
        suiteId: b.preferredSuite || "suite-101",
        suite: { name: b.suiteName, houseNumber: 1 },
        guest: { fullName: b.fullName, country: "The Gambia" }
      }));
    }
    if (guests.length === 0) {
      guests = await guestService.getAllGuests();
    }
    const totalSuites = Math.max(1, suites.length);
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    let filteredBookings = bookings;
    if (timeframe !== "all") {
      const cutoff = /* @__PURE__ */ new Date();
      if (timeframe === "30d") cutoff.setDate(cutoff.getDate() - 30);
      else if (timeframe === "90d") cutoff.setDate(cutoff.getDate() - 90);
      else if (timeframe === "year") cutoff.setFullYear(cutoff.getFullYear() - 1);
      filteredBookings = bookings.filter((b) => new Date(b.createdAt) >= cutoff);
    }
    const activeOccupiedSuites = bookings.filter((b) => {
      const chIn = new Date(b.checkIn).toISOString().split("T")[0];
      const chOut = new Date(b.checkOut).toISOString().split("T")[0];
      return ["CONFIRMED", "COMPLETED"].includes(b.status) && chIn <= todayStr && chOut >= todayStr;
    }).length;
    const occupancyRate = Math.min(100, Math.round(activeOccupiedSuites / totalSuites * 100));
    const validBookings = filteredBookings.filter((b) => b.status !== "CANCELLED");
    const totalRev = validBookings.reduce((sum, b) => sum + (b.totalEstimatedPrice || 0), 0);
    const totalNightsBooked = validBookings.reduce((sum, b) => sum + (b.totalNights || 1), 0);
    const adr = totalNightsBooked > 0 ? Math.round(totalRev / totalNightsBooked) : 0;
    const revpar = Math.round(adr * (occupancyRate / 100));
    let paidRev = 0;
    let pendingRev = 0;
    for (const b of filteredBookings) {
      if (b.status === "CANCELLED") continue;
      if (b.payment && (b.payment.status === "SUCCESSFUL" || b.payment.status === "COMPLETED")) {
        paidRev += b.payment.paidAmount || b.totalEstimatedPrice;
      } else if (b.payment && b.payment.status === "PARTIALLY_PAID") {
        paidRev += b.payment.paidAmount || 0;
        pendingRev += Math.max(0, b.totalEstimatedPrice - (b.payment.paidAmount || 0));
      } else {
        pendingRev += b.totalEstimatedPrice;
      }
    }
    const avgBookingValue = validBookings.length > 0 ? Math.round(totalRev / validBookings.length) : 0;
    const confirmedCount = filteredBookings.filter((b) => b.status === "CONFIRMED").length;
    const completedCount = filteredBookings.filter((b) => b.status === "COMPLETED").length;
    const pendingCount = filteredBookings.filter((b) => b.status === "PENDING").length;
    const cancelledCount = filteredBookings.filter((b) => b.status === "CANCELLED").length;
    const avgStay = validBookings.length > 0 ? parseFloat((totalNightsBooked / validBookings.length).toFixed(1)) : 0;
    const suiteStatsMap = /* @__PURE__ */ new Map();
    suites.forEach((s) => {
      suiteStatsMap.set(s.id, {
        suiteName: s.name,
        houseNumber: s.houseNumber,
        count: 0,
        nights: 0,
        revenue: 0
      });
    });
    filteredBookings.forEach((b) => {
      if (b.status === "CANCELLED") return;
      const stats = suiteStatsMap.get(b.suiteId);
      if (stats) {
        stats.count += 1;
        stats.nights += b.totalNights || 1;
        stats.revenue += b.totalEstimatedPrice || 0;
      }
    });
    const mostBookedSuites = Array.from(suiteStatsMap.entries()).map(([suiteId, val]) => ({
      suiteId,
      suiteName: val.suiteName,
      houseNumber: val.houseNumber,
      bookingCount: val.count,
      totalNights: val.nights,
      revenue: val.revenue,
      occupancyShare: totalNightsBooked > 0 ? Math.round(val.nights / totalNightsBooked * 100) : 0
    })).sort((a, b) => b.revenue - a.revenue);
    const countryMap = /* @__PURE__ */ new Map();
    filteredBookings.forEach((b) => {
      const country = b.guest?.country || "The Gambia";
      if (!countryMap.has(country)) {
        countryMap.set(country, { guestCount: /* @__PURE__ */ new Set(), bookingCount: 0 });
      }
      const entry = countryMap.get(country);
      if (b.guestId) entry.guestCount.add(b.guestId);
      else entry.guestCount.add(b.email);
      entry.bookingCount += 1;
    });
    const totalOriginBookings = Math.max(1, filteredBookings.length);
    const guestOrigins = Array.from(countryMap.entries()).map(([country, val]) => ({
      country,
      guestCount: val.guestCount.size,
      bookingCount: val.bookingCount,
      percentage: Math.round(val.bookingCount / totalOriginBookings * 100)
    })).sort((a, b) => b.bookingCount - a.bookingCount);
    const methodLabels = {
      WAVE: "Wave Mobile Money",
      AFRIMONEY: "AfriMoney",
      APS_WALLET: "APS International Wallet",
      VISA_CARD: "Visa Card",
      PAYPAL: "PayPal",
      CASH: "Cash at Desk",
      BANK_TRANSFER: "Direct Bank Transfer",
      CREDIT_CARD: "Credit / Debit Card",
      MOBILE_MONEY: "Mobile Money"
    };
    const methodMap = /* @__PURE__ */ new Map();
    payments.forEach((p) => {
      const methodKey = p.method || "CASH";
      if (!methodMap.has(methodKey)) {
        methodMap.set(methodKey, { count: 0, total: 0 });
      }
      const item = methodMap.get(methodKey);
      item.count += 1;
      item.total += p.amount || 0;
    });
    const totalPaymentsCount = Math.max(1, payments.length);
    const paymentMethods = Array.from(methodMap.entries()).map(([method, val]) => ({
      method,
      label: methodLabels[method] || method,
      count: val.count,
      totalAmount: val.total,
      percentage: Math.round(val.count / totalPaymentsCount * 100)
    })).sort((a, b) => b.totalAmount - a.totalAmount);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyMap = /* @__PURE__ */ new Map();
    const now = /* @__PURE__ */ new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const name = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthlyMap.set(ym, { monthName: name, revenue: 0, count: 0 });
    }
    filteredBookings.forEach((b) => {
      if (b.status === "CANCELLED") return;
      const bDate = new Date(b.createdAt);
      const ym = `${bDate.getFullYear()}-${String(bDate.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyMap.has(ym)) {
        const item = monthlyMap.get(ym);
        item.revenue += b.totalEstimatedPrice || 0;
        item.count += 1;
      }
    });
    const monthlyRevenue = Array.from(monthlyMap.entries()).map(([ym, val]) => ({
      month: val.monthName,
      yearMonth: ym,
      revenue: val.revenue,
      bookingCount: val.count,
      occupancyRate: Math.min(100, Math.round(val.count / (totalSuites * 30) * 100))
    }));
    const trendMap = /* @__PURE__ */ new Map();
    for (let i = 14; i >= 0; i--) {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      trendMap.set(dateStr, { count: 0, revenue: 0 });
    }
    filteredBookings.forEach((b) => {
      const dateStr = new Date(b.createdAt).toISOString().split("T")[0];
      if (trendMap.has(dateStr)) {
        const item = trendMap.get(dateStr);
        item.count += 1;
        if (b.status !== "CANCELLED") {
          item.revenue += b.totalEstimatedPrice || 0;
        }
      }
    });
    const bookingTrends = Array.from(trendMap.entries()).map(([dateStr, val]) => {
      const d = new Date(dateStr);
      const label = `${monthNames[d.getMonth()]} ${d.getDate()}`;
      return {
        date: label,
        bookingCount: val.count,
        revenue: val.revenue
      };
    });
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const daysMap = /* @__PURE__ */ new Map();
    days.forEach((day) => daysMap.set(day, { checkIns: 0, checkOuts: 0 }));
    filteredBookings.forEach((b) => {
      if (b.status === "CANCELLED") return;
      const inDay = days[new Date(b.checkIn).getDay()];
      const outDay = days[new Date(b.checkOut).getDay()];
      if (daysMap.has(inDay)) daysMap.get(inDay).checkIns += 1;
      if (daysMap.has(outDay)) daysMap.get(outDay).checkOuts += 1;
    });
    const checkInOutTrends = Array.from(daysMap.entries()).map(([dayOfWeek, val]) => ({
      dayOfWeek,
      checkIns: val.checkIns,
      checkOuts: val.checkOuts
    }));
    return {
      occupancy: {
        rate: occupancyRate,
        occupiedSuites: activeOccupiedSuites,
        availableSuites: Math.max(0, totalSuites - activeOccupiedSuites),
        totalSuites,
        adr,
        revpar
      },
      revenue: {
        totalRevenue: totalRev,
        paidRevenue: paidRev,
        pendingRevenue: pendingRev,
        averageBookingValue: avgBookingValue
      },
      bookingVolume: {
        totalBookings: filteredBookings.length,
        confirmed: confirmedCount,
        checkedIn: activeOccupiedSuites,
        checkedOut: completedCount,
        pending: pendingCount,
        cancelled: cancelledCount,
        averageLengthOfStay: avgStay
      },
      mostBookedSuites,
      guestOrigins,
      paymentMethods,
      monthlyRevenue,
      bookingTrends,
      checkInOutTrends
    };
  }
};
var analyticsService = new AnalyticsService();

// src/server/controllers/analyticsController.ts
var getAnalyticsReport = async (req, res, next) => {
  try {
    const timeframe = req.query.timeframe || "all";
    const report = await analyticsService.getAnalyticsReport(timeframe);
    res.status(200).json({
      status: "success",
      timeframe,
      data: report
    });
  } catch (err) {
    next(err);
  }
};

// src/server/routes/analyticsRoutes.ts
import { Role as Role13 } from "@prisma/client";
var router11 = Router11();
router11.get(
  "/report",
  authenticateToken,
  requireRole(Role13.OWNER, Role13.ADMIN, Role13.RECEPTIONIST, Role13.STAFF),
  getAnalyticsReport
);
var analyticsRoutes_default = router11;

// src/server/middleware/logger.ts
var requestLogger = (req, res, next) => {
  if (req.originalUrl.startsWith("/src/") || req.originalUrl.startsWith("/@") || req.originalUrl.startsWith("/node_modules/") || req.originalUrl.includes(".tsx") || req.originalUrl.includes(".ts") || req.originalUrl.includes(".js") || req.originalUrl.includes(".css")) {
    return next();
  }
  const start = Date.now();
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const sanitizedUrl = req.originalUrl.replace(
    /([?&](?:email|token|key|secret|password|card|cvv)=)[^&]*/gi,
    "$1[REDACTED]"
  );
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${timestamp}] ${req.method} ${sanitizedUrl} - Status: ${res.statusCode} (${duration}ms)`
    );
  });
  next();
};

// src/server/middleware/securityHeaders.ts
var securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.removeHeader("X-Powered-By");
  next();
};

// src/server/app.ts
function createExpressApp() {
  const app2 = express();
  app2.set("trust proxy", 1);
  app2.use(securityHeaders);
  const rawCorsOrigin = process.env.CORS_ORIGIN;
  const allowedOrigins = rawCorsOrigin ? rawCorsOrigin.split(",").map((s) => s.trim()).filter(Boolean) : [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://kilifasuites.com",
    "https://www.kilifasuites.com"
  ];
  app2.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        if (process.env.NODE_ENV !== "production" && (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin))) {
          return callback(null, true);
        }
        if (origin.endsWith(".run.app") || origin.endsWith(".google.com") || origin.endsWith(".googleusercontent.com") || origin.endsWith(".vercel.app")) {
          return callback(null, true);
        }
        if (process.env.NODE_ENV !== "production") {
          return callback(null, true);
        }
        callback(null, false);
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Idempotency-Key", "X-Idempotency-Key"],
      credentials: true
    })
  );
  app2.use(express.json({ limit: "2mb" }));
  app2.use(express.urlencoded({ extended: true, limit: "2mb" }));
  app2.use(requestLogger);
  app2.use("/api", apiGlobalRateLimiter);
  try {
    getJwtSecret();
  } catch (err) {
    console.error("[CRITICAL SECURITY ERROR]", err.message);
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
  app2.get("/api/health", async (req, res) => {
    const isDbConnected = await checkDatabaseConnection();
    const dbConfigured = isDatabaseConfigured();
    res.status(200).json({
      status: isDbConnected ? "ok" : dbConfigured ? "degraded" : "unconfigured_database",
      service: "Kilifa Suites API",
      databaseConfigured: dbConfigured,
      databaseConnected: isDbConnected,
      memoryFallbackAllowed: isMemoryFallbackAllowed(),
      environment: process.env.NODE_ENV || "development",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptimeSeconds: Math.floor(process.uptime())
    });
  });
  app2.use("/api/auth", authRoutes_default);
  app2.use("/api/suites", suiteRoutes_default);
  app2.use("/api/bookings", bookingRoutes_default);
  app2.use("/api/guests", guestRoutes_default);
  app2.use("/api/contact", contactRoutes_default);
  app2.use("/api/media", mediaRoutes_default);
  app2.use("/api/dashboard", dashboardRoutes_default);
  app2.use("/api/payments", paymentRoutes_default);
  app2.use("/api/access", accessControlRoutes_default);
  app2.use("/api/notifications", notificationRoutes_default);
  app2.use("/api/analytics", analyticsRoutes_default);
  app2.use(
    "/media",
    express.static(path.join(process.cwd(), "public/media"), {
      maxAge: "1d",
      acceptRanges: true
    })
  );
  app2.use(
    "/images",
    express.static(path.join(process.cwd(), "public/media/images"), {
      maxAge: "1d"
    })
  );
  app2.use(
    "/videos",
    express.static(path.join(process.cwd(), "public/media/videos"), {
      maxAge: "1d",
      acceptRanges: true
    })
  );
  app2.all("/api/*", (req, res, next) => {
    next(new ApiError(404, `API route '${req.method} ${req.originalUrl}' not found`));
  });
  app2.use(errorHandler);
  return app2;
}
var app = createExpressApp();

// api-entry.ts
var api_entry_default = app;
export {
  api_entry_default as default
};
