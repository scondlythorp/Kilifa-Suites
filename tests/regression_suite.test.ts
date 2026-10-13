import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  BUSINESS_CONFIG,
  SUITES_DATA,
  HOUSES_DATA,
  OFFICIAL_SUITE_NAMES,
  MEDIA_GALLERY_DATA,
} from '../src/config/business';
import {
  STANDARD_ROOM_PRICE_GMD,
  PRIMARY_CURRENCY,
  formatGMD,
  formatNightlyRate,
  formatBookingTotal,
  formatFormalGMD,
  calculateStayTotal,
} from '../src/utils/currency';
import { MAIN_NAV_LINKS, DROPDOWN_NAV_LINKS } from '../src/components/layout/Navbar';

console.log('🏛️  KILIFA SUITES — PHASE 3 COMPREHENSIVE REGRESSION TEST SUITE\n');

// ==========================================
// 1. NAVIGATION & ROUTE DESTINATIONS
// ==========================================
console.log('--- 1. Testing Navigation & Route Destinations ---');

// Verify all six public main navigation destinations
assert.equal(MAIN_NAV_LINKS.length, 6, 'Navbar must feature 6 core public destinations');
const expectedMainDestinations = ['/', '/suites', '/about', '/amenities', '/gallery', '/contact'];
MAIN_NAV_LINKS.forEach((link, idx) => {
  assert.equal(link.href, expectedMainDestinations[idx], `Destination ${idx} must match ${expectedMainDestinations[idx]}`);
});
console.log('✅ Six core public navigation destinations verified (/ , /suites, /about, /amenities, /gallery, /contact)');

// Verify secondary dropdown destinations
const expectedDropdownDestinations = ['/guest-experience', '/security', '/workshops', '/location'];
assert.equal(DROPDOWN_NAV_LINKS.length, 4, 'Explore menu must have 4 supplementary destinations');
DROPDOWN_NAV_LINKS.forEach((link, idx) => {
  assert.equal(link.href, expectedDropdownDestinations[idx], `Dropdown destination ${idx} must match ${expectedDropdownDestinations[idx]}`);
});
console.log('✅ Supplementary destinations verified (/guest-experience, /security, /workshops, /location)');

// Test Suite Slug Resolution
function resolveSuite(slugOrIdOrName: string) {
  const normalized = slugOrIdOrName.toLowerCase().trim();
  return SUITES_DATA.find(
    (s) =>
      s.slug.toLowerCase() === normalized ||
      s.id.toLowerCase() === normalized ||
      s.name.toLowerCase() === normalized ||
      s.id.toLowerCase().replace('-0', '-') === normalized ||
      s.slug.toLowerCase().replace('-0', '-') === normalized
  );
}

assert.ok(resolveSuite('suite-01'), 'Resolve suite-01');
assert.ok(resolveSuite('suite-1'), 'Resolve suite-1 without leading zero');
assert.ok(resolveSuite('dar'), 'Resolve by lowercase name "dar"');
assert.ok(resolveSuite('DAR'), 'Resolve by uppercase name "DAR"');
assert.ok(resolveSuite('SUUDU'), 'Resolve by name "SUUDU" (House 2)');
assert.equal(resolveSuite('dar')?.name, 'DAR');
assert.equal(resolveSuite('dar')?.houseNumber, 1);
assert.equal(resolveSuite('suudu')?.houseNumber, 2);
console.log('✅ Suite slug resolution handles case, names, and slug variants');

// ==========================================
// 2. BOOKING REGRESSION TESTS
// ==========================================
console.log('\n--- 2. Testing Booking Calculations & Date Validation ---');

// Standard room price & Currency
assert.equal(PRIMARY_CURRENCY, 'GMD');
assert.equal(STANDARD_ROOM_PRICE_GMD, 2500);

// Stay calculations
assert.equal(calculateStayTotal(2500, 1), 2500, '1 night = 2500');
assert.equal(calculateStayTotal(2500, 2), 5000, '2 nights = 5000');
assert.equal(calculateStayTotal(2500, 3), 7500, '3 nights = 7500');
assert.equal(calculateStayTotal(2500, 7), 17500, '7 nights = 17500');
assert.equal(calculateStayTotal(2500, 14), 35000, '14 nights = 35000');
assert.equal(calculateStayTotal(2500, 30), 75000, '30 nights = 75000');

// Night duration calculation
function calculateNights(startStr: string, endStr: string): number {
  const [sy, sm, sd] = startStr.split('-').map(Number);
  const [ey, em, ed] = endStr.split('-').map(Number);
  const startUtc = Date.UTC(sy, sm - 1, sd);
  const endUtc = Date.UTC(ey, em - 1, ed);
  return Math.round((endUtc - startUtc) / 86400000);
}

assert.equal(calculateNights('2026-10-15', '2026-10-16'), 1);
assert.equal(calculateNights('2026-10-15', '2026-10-22'), 7);
assert.equal(calculateNights('2026-10-28', '2026-11-04'), 7); // Across month boundary
assert.equal(calculateNights('2026-12-28', '2027-01-04'), 7); // Across year boundary
assert.equal(calculateNights('2028-02-28', '2028-03-01'), 2); // Leap year 2028
console.log('✅ Date duration calculations validated across calendar and leap year boundaries');

// ==========================================
// 3. MEDIA ASSET INTEGRITY
// ==========================================
console.log('\n--- 3. Testing Media Asset Integrity ---');

// Check hero media
const heroVideo = path.join(process.cwd(), 'public/media/videos/kilifa-property-exterior-tour-01.mp4');
const heroImage = path.join(process.cwd(), 'public/media/images/kilifa-property-exterior-01.jpeg');
assert.ok(fs.existsSync(heroVideo), 'Hero background video must exist');
assert.ok(fs.existsSync(heroImage), 'Hero fallback poster image must exist');

// Verify all suite featured and gallery images
let suiteImageCount = 0;
SUITES_DATA.forEach((suite) => {
  const featPath = path.join(process.cwd(), 'public', suite.featuredImage);
  assert.ok(fs.existsSync(featPath), `Featured image for suite ${suite.name} must exist: ${suite.featuredImage}`);
  suiteImageCount++;

  suite.galleryImages.forEach((galImg) => {
    const galPath = path.join(process.cwd(), 'public', galImg);
    assert.ok(fs.existsSync(galPath), `Gallery image for suite ${suite.name} must exist: ${galImg}`);
    suiteImageCount++;
  });
});
console.log(`✅ Verified ${suiteImageCount} suite media paths on disk`);

// Verify all general gallery media
MEDIA_GALLERY_DATA.forEach((item) => {
  const mediaPath = path.join(process.cwd(), 'public', item.url);
  assert.ok(fs.existsSync(mediaPath), `Gallery item ${item.caption} must exist at: ${item.url}`);
  if (item.thumbnail) {
    const thumbPath = path.join(process.cwd(), 'public', item.thumbnail);
    assert.ok(fs.existsSync(thumbPath), `Thumbnail for ${item.caption} must exist: ${item.thumbnail}`);
  }
});
console.log(`✅ All ${MEDIA_GALLERY_DATA.length} gallery media assets verified on disk`);

// ==========================================
// 4. ADMIN & SECURITY VERIFICATION
// ==========================================
console.log('\n--- 4. Testing Admin & Security Hardening ---');

// Verify SecurityPage does not contain mock test card data structures
const securityPageContent = fs.readFileSync(
  path.join(process.cwd(), 'src/pages/SecurityPage.tsx'),
  'utf8'
);
assert.ok(!securityPageContent.includes('sampleCards'), 'Public SecurityPage must not include sampleCards');
assert.ok(!securityPageContent.includes('KC-7729-01'), 'Public SecurityPage must not expose test card IDs');
assert.ok(!securityPageContent.includes('AccessCard JSON Payload'), 'Public SecurityPage must not render JSON debug widgets');
console.log('✅ Public SecurityPage verified: 0 development test widgets or sample cards');

// Verify access control routes require authentication
const accessRoutesContent = fs.readFileSync(
  path.join(process.cwd(), 'src/server/routes/accessControlRoutes.ts'),
  'utf8'
);
assert.ok(accessRoutesContent.includes('router.use(authenticateToken)'), 'Access control routes must require authentication');
console.log('✅ Backend access control routes protected with JWT authentication');

// ==========================================
// 5. BUSINESS & CONTENT ACCURACY
// ==========================================
console.log('\n--- 5. Testing Business & Content Information ---');

assert.equal(BUSINESS_CONFIG.owner, 'Kilifa Suites Management', 'Proprietor must be Kilifa Suites Management');
assert.equal(BUSINESS_CONFIG.location.neighborhood, 'Tabokoto');
assert.equal(BUSINESS_CONFIG.location.city, 'Soma');
assert.equal(BUSINESS_CONFIG.location.region, 'Lower River Region');
assert.equal(BUSINESS_CONFIG.location.country, 'The Gambia');

assert.equal(HOUSES_DATA.length, 2, 'Must have exactly 2 houses');
assert.equal(SUITES_DATA.length, 12, 'Must have exactly 12 suites');

const house1Suites = SUITES_DATA.filter((s) => s.houseNumber === 1);
const house2Suites = SUITES_DATA.filter((s) => s.houseNumber === 2);
assert.equal(house1Suites.length, 6, 'House 1 must have 6 suites (01-06)');
assert.equal(house2Suites.length, 6, 'House 2 must have 6 suites (07-12)');

const expectedNames = [
  'DAR', 'SAMA', 'LAAWOL', 'EJAM', 'YERMANDE', 'BAJAM',
  'SUUDU', 'WURO', 'YIDI', 'KENE', 'SAGO', 'NDIYA'
];
assert.deepEqual(OFFICIAL_SUITE_NAMES, expectedNames, 'Official 12 suite names must match exactly');
console.log('✅ Business data, location, 2 houses, and 12 suite assignments fully verified');

// ==========================================
// 6. LUXURY ANNOUNCEMENT BAR VERIFICATION
// ==========================================
console.log('\n--- 6. Testing Luxury Announcement Bar ---');
const { ANNOUNCEMENT_MESSAGES } = await import('../src/components/layout/AnnouncementBar');
assert.ok(Array.isArray(ANNOUNCEMENT_MESSAGES), 'ANNOUNCEMENT_MESSAGES must be an array');
assert.equal(ANNOUNCEMENT_MESSAGES.length, 4, 'Must have exactly 4 luxury announcement messages');
assert.ok(ANNOUNCEMENT_MESSAGES[0].text.includes('Welcome to Kilifa Suites'), 'Message 1 must be welcome message');
assert.ok(ANNOUNCEMENT_MESSAGES[1].text.includes('Experience Exceptional Comfort'), 'Message 2 must be comfort message');
assert.ok(ANNOUNCEMENT_MESSAGES[2].text.includes('Discover Your Perfect Stay'), 'Message 3 must be perfect stay message');
assert.ok(ANNOUNCEMENT_MESSAGES[3].text.includes('Contact Us Today'), 'Message 4 must be contact message');
console.log('✅ Luxury Announcement Bar verified with all 4 looping messages');

console.log('\n======================================================');
console.log('🏆 ALL PHASE 3 REGRESSION TESTS PASSED (0 FAILURES)!');
console.log('======================================================\n');
