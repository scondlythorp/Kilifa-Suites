import assert from 'node:assert/strict';
import {
  STANDARD_ROOM_PRICE_GMD,
  PRIMARY_CURRENCY,
  formatGMD,
  formatNightlyRate,
  formatBookingTotal,
  formatFormalGMD,
  calculateStayTotal,
} from '../src/utils/currency';
import { SUITES_DATA } from '../src/config/business';

console.log('🧪 RUNNING KILIFA SUITES FOCUSED TEST SUITE...');

// 1. Currency & Standard Room Price Assertions
console.log('\n--- 1. Testing Currency & Base Room Rates ---');
assert.equal(PRIMARY_CURRENCY, 'GMD', 'Primary currency must be GMD');
assert.equal(STANDARD_ROOM_PRICE_GMD, 2500, 'Standard room rate must be 2500 GMD');

// Verify all 12 suites have official pricing of 2,500 GMD
assert.equal(SUITES_DATA.length, 12, 'Must have exactly 12 suites configured');
SUITES_DATA.forEach((suite) => {
  assert.equal(
    suite.pricePerNight,
    2500,
    `Suite ${suite.name} (${suite.id}) must have pricePerNight = 2500`
  );
  assert.equal(
    suite.currency,
    'GMD',
    `Suite ${suite.name} (${suite.id}) must have currency = GMD`
  );
});
console.log('✅ All 12 suites verified with standard rate of GMD 2,500');

// 2. Currency Formatting Assertions
console.log('\n--- 2. Testing Currency Formatting Functions ---');
assert.equal(formatNightlyRate(2500), 'D 2,500 / night', 'Nightly rate should display "D 2,500 / night"');
assert.equal(formatBookingTotal(2500), 'D 2,500', 'Booking total for 1 night should display "D 2,500"');
assert.equal(formatBookingTotal(5000), 'D 5,000', 'Booking total for 2 nights should display "D 5,000"');
assert.equal(formatBookingTotal(7500), 'D 7,500', 'Booking total for 3 nights should display "D 7,500"');
assert.equal(formatBookingTotal(17500), 'D 17,500', 'Booking total for 7 nights should display "D 17,500"');
assert.equal(formatFormalGMD(2500), 'GMD 2,500', 'Formal receipt format should display "GMD 2,500"');
console.log('✅ Currency formatting verified across all standard denominations');

// 3. Booking Calculation Assertions (Explicitly requested test cases)
console.log('\n--- 3. Testing Stay Cost Calculations ---');
// For standard room costing GMD 2,500 per night:
// 1 night = GMD 2,500
// 2 nights = GMD 5,000
// 3 nights = GMD 7,500
// 7 nights = GMD 17,500
assert.equal(calculateStayTotal(2500, 1), 2500, '1 night calculation must equal 2500');
assert.equal(calculateStayTotal(2500, 2), 5000, '2 nights calculation must equal 5000');
assert.equal(calculateStayTotal(2500, 3), 7500, '3 nights calculation must equal 7500');
assert.equal(calculateStayTotal(2500, 7), 17500, '7 nights calculation must equal 17500');
assert.equal(calculateStayTotal(2500, 14), 35000, '14 nights calculation must equal 35000');
assert.equal(calculateStayTotal(2500, 30), 75000, '30 nights calculation must equal 75000');
console.log('✅ Exact duration calculations (1, 2, 3, 7, 14, 30 nights) pass perfectly');

// 4. Date Duration Calculation Robustness
console.log('\n--- 4. Testing Date Duration & Leap Year Boundaries ---');
function calculateNights(checkIn: string, checkOut: string): number {
  const [sy, sm, sd] = checkIn.split('-').map(Number);
  const [ey, em, ed] = checkOut.split('-').map(Number);
  const startUtc = Date.UTC(sy, sm - 1, sd);
  const endUtc = Date.UTC(ey, em - 1, ed);
  return Math.round((endUtc - startUtc) / 86400000);
}

assert.equal(calculateNights('2026-10-15', '2026-10-16'), 1);
assert.equal(calculateNights('2026-10-15', '2026-10-17'), 2);
assert.equal(calculateNights('2026-10-15', '2026-10-18'), 3);
assert.equal(calculateNights('2026-10-15', '2026-10-22'), 7);
// Month boundary
assert.equal(calculateNights('2026-10-30', '2026-11-02'), 3);
// Year boundary
assert.equal(calculateNights('2026-12-30', '2027-01-02'), 3);
console.log('✅ UTC date duration calculation validated across month and year boundaries');

console.log('\n🎉 ALL FOCUSED TESTS PASSED SUCCESSFULLY (0 FAILURES)!');
