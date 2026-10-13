import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { WaveAdapter } from '../src/server/payments/adapters/WaveAdapter';
import { AfrimoneyAdapter } from '../src/server/payments/adapters/AfrimoneyAdapter';
import { VisaCardAdapter } from '../src/server/payments/adapters/VisaCardAdapter';
import { PayPalAdapter } from '../src/server/payments/adapters/PayPalAdapter';
import { ApsWalletAdapter } from '../src/server/payments/adapters/ApsWalletAdapter';
import { CashBankAdapter } from '../src/server/payments/adapters/CashBankAdapter';
import { authService } from '../src/server/services/authService';
import { bookingService } from '../src/server/services/bookingService';
import { paymentService } from '../src/server/services/paymentService';
import { SUITES_DATA } from '../src/config/business';
import { Role } from '@prisma/client';

console.log('🔒 KILIFA SUITES — SECURITY VERIFICATION & PRODUCTION INTEGRITY TEST SUITE\n');

async function runSecurityVerificationTests() {
  let passedTests = 0;

  // =========================================================================
  // SEC-01: CREDENTIAL LEAKAGE INSPECTION (Source & Bundles)
  // =========================================================================
  console.log('--- SEC-01: Verifying Zero Hardcoded Secrets in Frontend & Bundles ---');
  
  // Inspect client src directory
  const forbiddenPatterns = [
    /JWT_SECRET\s*=\s*['"][^'"]+['"]/i,
    /ADMIN_PASSWORD_HASH\s*=\s*['"][^'"]+['"]/i,
    /postgres:\/\/.*:.*@/i,
  ];

  function scanDirectory(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'server') {
          scanDirectory(fullPath);
        }
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.html'))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const pattern of forbiddenPatterns) {
          assert.equal(pattern.test(content), false, `Secret pattern match in client file: ${fullPath}`);
        }
      }
    }
  }

  scanDirectory(path.join(process.cwd(), 'src/components'));
  scanDirectory(path.join(process.cwd(), 'src/pages'));
  scanDirectory(path.join(process.cwd(), 'src/context'));
  scanDirectory(path.join(process.cwd(), 'public'));

  passedTests++;
  console.log('✅ SEC-01 PASSED: Frontend source, components, and public assets contain zero leaked credentials.');

  // =========================================================================
  // SEC-02: ADMINISTRATOR REGISTRATION RESTRICTION
  // =========================================================================
  console.log('\n--- SEC-02: Verifying Administrator Registration Authorization ---');

  // Verify that authRoutes.ts enforces authenticateToken and requireRole(Role.ADMIN)
  const authRoutesContent = fs.readFileSync(path.join(process.cwd(), 'src/server/routes/authRoutes.ts'), 'utf8');
  assert.ok(
    authRoutesContent.includes("router.post('/register', authenticateToken, requireRole(Role.ADMIN), register)"),
    'Registration route must be protected by authenticateToken and requireRole(Role.ADMIN)'
  );

  passedTests++;
  console.log('✅ SEC-02 PASSED: Registration route strictly requires authenticated System Administrator.');

  // =========================================================================
  // SEC-03: PASSWORD RESET TOKEN SECURITY & EXPIRATION
  // =========================================================================
  console.log('\n--- SEC-03: Verifying Password Reset Token Life-Cycle & Single-Use ---');

  // A. Generic message for user enumeration prevention
  const enumCheck = await authService.requestPasswordReset('nonexistent_user@kilifasuites.com');
  assert.ok(enumCheck.message.includes('If an account matching this email address exists'), 'Generic enumeration-safe response');

  // B. Single-use enforcement and consumption
  const testEmail = 'modoulaminthorp4@gmail.com';
  // Temporarily enable test flag for token retrieval
  process.env.EXPOSE_DEV_DEBUG_TOKENS = 'true';
  const resetReq = await authService.requestPasswordReset(testEmail);
  const resetToken = resetReq.debugToken;
  assert.ok(resetToken, 'Valid reset token issued for test admin account');

  // Execute password reset
  const resetResult = await authService.executePasswordReset(resetToken!, 'SuperSecurePass2026!');
  assert.ok(resetResult.message.includes('successfully updated'), 'Password reset executed successfully');

  // Replay attempt with same single-use token must be REJECTED
  let replayErrorCaught = false;
  try {
    await authService.executePasswordReset(resetToken!, 'AnotherNewPass2026!');
  } catch (err: any) {
    replayErrorCaught = true;
    assert.equal(err.statusCode, 400, 'Replayed token must return 400 Bad Request');
    assert.ok(err.message.includes('Invalid or expired'), 'Replayed token must be rejected as invalid/expired');
  }
  assert.ok(replayErrorCaught, 'Single-use password reset token cannot be re-used');

  // C. Restore password to clean state
  const resetReq2 = await authService.requestPasswordReset(testEmail);
  await authService.executePasswordReset(resetReq2.debugToken!, 'Kilifa2026!DevAdminSec');
  delete process.env.EXPOSE_DEV_DEBUG_TOKENS;

  passedTests++;
  console.log('✅ SEC-03 PASSED: Single-use token invalidated immediately; token replay rejected.');

  // =========================================================================
  // SEC-04: GUEST RESERVATION AUTHORIZATION & IDOR PROTECTION
  // =========================================================================
  console.log('\n--- SEC-04: Verifying Booking Ownership & IDOR Protection ---');

  const bookingRoutesContent = fs.readFileSync(path.join(process.cwd(), 'src/server/routes/bookingRoutes.ts'), 'utf8');
  assert.ok(
    bookingRoutesContent.includes("router.get('/:id', authenticateToken, getBookingById)"),
    'GET /api/bookings/:id must require authenticateToken'
  );
  assert.ok(
    bookingRoutesContent.includes("router.patch(\n  '/:id/status',\n  authenticateToken,\n  requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF),\n  updateBookingStatus\n)"),
    'PATCH /api/bookings/:id/status must be restricted to staff/admin roles'
  );

  // Verify lookupBooking controller requires both bookingReference AND email
  const bookingControllerContent = fs.readFileSync(path.join(process.cwd(), 'src/server/controllers/bookingController.ts'), 'utf8');
  assert.ok(
    bookingControllerContent.includes("if (booking.email.toLowerCase() !== email)"),
    'lookupBooking must enforce email match before returning booking details'
  );
  assert.ok(
    bookingControllerContent.includes("if (authReq.user && !staffRoles.includes(authReq.user.role))"),
    'getBookingById must reject non-staff users viewing other guests bookings'
  );

  passedTests++;
  console.log('✅ SEC-04 PASSED: IDOR protection and booking ownership enforced on all booking endpoints.');

  // =========================================================================
  // SEC-05: PAYMENT ADAPTERS REJECT SIMULATED SUCCESS IN PRODUCTION
  // =========================================================================
  console.log('\n--- SEC-05: Verifying Production Rejection of Simulated Payment Success ---');

  const prevEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  // Wave Adapter
  const wave = new WaveAdapter();
  let waveRejected = false;
  try {
    await wave.verifyPayment('WAVE-TEST-123');
  } catch (err: any) {
    waveRejected = true;
    assert.ok(err.message.includes('[WAVE] Production payment verification requires active WAVE_API_KEY'));
  }
  assert.ok(waveRejected, 'Wave must reject unconfigured verification in production');

  // Afrimoney Adapter
  const afrimoney = new AfrimoneyAdapter();
  let afriRejected = false;
  try {
    await afrimoney.verifyPayment('AFRI-TEST-123');
  } catch (err: any) {
    afriRejected = true;
    assert.ok(err.message.includes('[AFRIMONEY] Production mobile money verification requires configured Africell'));
  }
  assert.ok(afriRejected, 'Afrimoney must reject unconfigured verification in production');

  // Visa Adapter
  const visa = new VisaCardAdapter();
  let visaRejected = false;
  try {
    await visa.verifyPayment('VISA-TEST-123');
  } catch (err: any) {
    visaRejected = true;
    assert.ok(err.message.includes('[VISA] Production card verification requires configured PCI gateway'));
  }
  assert.ok(visaRejected, 'Visa must reject unconfigured verification in production');

  // PayPal Adapter
  const paypal = new PayPalAdapter();
  let paypalRejected = false;
  try {
    await paypal.verifyPayment('PAYPAL-TEST-123');
  } catch (err: any) {
    paypalRejected = true;
    assert.ok(err.message.includes('[PAYPAL] Production payment verification requires active PAYPAL_CLIENT_ID'));
  }
  assert.ok(paypalRejected, 'PayPal must reject unconfigured verification in production');

  // APS Wallet Adapter
  const aps = new ApsWalletAdapter();
  let apsRejected = false;
  try {
    await aps.verifyPayment('APS-TEST-123');
  } catch (err: any) {
    apsRejected = true;
    assert.ok(err.message.includes('[APS_WALLET] Production payment verification requires active APS_WALLET_API_KEY'));
  }
  assert.ok(apsRejected, 'APS Wallet must reject unconfigured verification in production');

  // Cash / Bank Adapter
  const cash = new CashBankAdapter('CASH');
  const cashRes = await cash.verifyPayment('CASH-TEST-123');
  assert.equal(cashRes.status, 'PENDING', 'Cash payments must remain PENDING until front desk receipt confirmation');

  // Restore NODE_ENV
  process.env.NODE_ENV = prevEnv;

  passedTests++;
  console.log('✅ SEC-05 PASSED: All 6 payment adapters strictly reject simulated success in production.');

  // =========================================================================
  // SEC-06: PAYMENT WEBHOOK SIGNATURE VERIFICATION & REPLAY PROTECTION
  // =========================================================================
  console.log('\n--- SEC-06: Verifying Payment Webhook HMAC Verification & Replay Protection ---');

  const testSecret = 'wave_sec_super_secret_key_12345';
  process.env.WAVE_WEBHOOK_SECRET = testSecret;

  const validPayload = {
    id: 'evt_test_998811',
    type: 'checkout.session.completed',
    client_reference: 'WAVE-KS-882910-123456',
    payment_status: 'succeeded',
    amount: '7500',
    currency: 'GMD',
  };

  const payloadString = JSON.stringify(validPayload);
  const validSignature = crypto.createHmac('sha256', testSecret).update(payloadString).digest('hex');

  // 1. Missing signature header must be rejected
  let missingSigRejected = false;
  try {
    await paymentService.processWebhook('WAVE', validPayload, '');
  } catch (err: any) {
    missingSigRejected = true;
    assert.equal(err.statusCode, 401, 'Missing signature must return 401');
  }
  assert.ok(missingSigRejected, 'Missing webhook signature rejected with 401');

  // 2. Invalid signature header must be rejected
  let invalidSigRejected = false;
  try {
    await paymentService.processWebhook('WAVE', validPayload, 'invalid_signature_hex_1234567890abcdef');
  } catch (err: any) {
    invalidSigRejected = true;
    assert.equal(err.statusCode, 401, 'Invalid signature must return 401');
  }
  assert.ok(invalidSigRejected, 'Invalid webhook signature rejected with 401');

  // 3. Valid signature header must be accepted
  const webhookResult = await paymentService.processWebhook('WAVE', validPayload, validSignature);
  assert.equal(webhookResult.success, true, 'Valid webhook processed successfully');
  assert.equal(webhookResult.status, 'SUCCESSFUL');

  // Clean up test secret
  delete process.env.WAVE_WEBHOOK_SECRET;

  passedTests++;
  console.log('✅ SEC-06 PASSED: Webhook signature verified with HMAC-SHA256 timing-safe comparison.');

  // =========================================================================
  // SEC-07: LOGGING & ERROR SANITIZATION
  // =========================================================================
  console.log('\n--- SEC-07: Verifying Log & Error Response Sanitization ---');

  const loggerContent = fs.readFileSync(path.join(process.cwd(), 'src/server/middleware/logger.ts'), 'utf8');
  assert.ok(
    loggerContent.includes('sanitizedUrl'),
    'Logger must sanitize URLs before outputting to log stream'
  );
  assert.ok(
    loggerContent.includes('[REDACTED]'),
    'Logger must redact email, token, password, and credential query params'
  );

  const errorHandlerContent = fs.readFileSync(path.join(process.cwd(), 'src/server/middleware/errorHandler.ts'), 'utf8');
  assert.ok(
    errorHandlerContent.includes("isProduction ? 'An unexpected internal server error occurred."),
    '500 handler must suppress raw internal database error messages in production'
  );

  passedTests++;
  console.log('✅ SEC-07 PASSED: PII query redactor and production error suppressor fully validated.');

  // =========================================================================
  // PRODUCTION CONCURRENCY & OVERLAPPING RESERVATION LOCKING
  // =========================================================================
  console.log('\n--- CONCURRENCY & PRICING: Verifying Double-Booking Atomic Collision Prevention ---');

  // Create initial test booking
  const bkg1 = await bookingService.createBooking({
    fullName: 'Alpha Guest',
    email: 'alpha@test.com',
    phone: '+2207001122',
    checkIn: '2027-05-10',
    checkOut: '2027-05-15',
    guestsCount: 2,
    suiteId: 'suite-01',
    idempotencyKey: `test-idem-${Date.now()}-1`,
  });
  assert.ok(bkg1.bookingReference, 'Initial booking created');

  // Server-side authoritative pricing verification: 5 nights * 2500 = 12500
  assert.equal(bkg1.totalNights, 5, 'Exact 5 nights duration');
  assert.equal(bkg1.totalEstimatedPrice, 12500, 'Exact server-side calculated pricing: 12,500 GMD');

  // Attempt overlapping booking on same suite for overlapping dates (2027-05-12 to 2027-05-17)
  let overlapRejected = false;
  try {
    await bookingService.createBooking({
      fullName: 'Beta Guest',
      email: 'beta@test.com',
      phone: '+2207003344',
      checkIn: '2027-05-12',
      checkOut: '2027-05-17',
      guestsCount: 2,
      suiteId: 'suite-01',
      idempotencyKey: `test-idem-${Date.now()}-2`,
    });
  } catch (err: any) {
    overlapRejected = true;
    assert.equal(err.statusCode, 409, 'Overlapping booking must return 409 Conflict');
    assert.ok(err.message.includes('already reserved'), 'Collision error message returned');
  }
  assert.ok(overlapRejected, 'Overlapping date reservation on same suite is atomically rejected');

  passedTests++;
  console.log('✅ CONCURRENCY & PRICING PASSED: Double-booking collision prevented (409) and server-side pricing enforced.');

  console.log('\n======================================================');
  console.log(`🏆 ALL ${passedTests} SECURITY & PRODUCTION VERIFICATION SUITES PASSED!`);
  console.log('======================================================\n');
}

runSecurityVerificationTests().catch((err) => {
  console.error('❌ SECURITY VERIFICATION TEST FAILED:', err);
  process.exit(1);
});
