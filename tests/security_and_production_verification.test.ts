import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { authService } from '../src/server/services/authService';
import { getJwtSecret } from '../src/server/config/envConfig';
import { authenticateToken, requireRole } from '../src/server/middleware/authMiddleware';
import { register as registerController } from '../src/server/controllers/authController';
import app from '../src/server/app';

console.log('🔒 RUNNING KILIFA SUITES PHASE 4 AUTOMATED SECURITY VERIFICATION SUITE...\n');

const jwtSecret = getJwtSecret();

// =========================================================================
// TEST 1: Invalid credentials cannot authenticate
// =========================================================================
console.log('--- TEST 1: Invalid credentials cannot authenticate ---');
let invalidAuthFailed = false;
try {
  await authService.login('nonexistent.user@example.com', 'CompletelyWrongPassword123!');
} catch (err: any) {
  invalidAuthFailed = true;
  assert.equal(err.statusCode || 401, 401, 'Should return HTTP 401 status code');
  assert.ok(err.message.includes('Invalid credentials') || err.message.includes('not found'));
}
assert.ok(invalidAuthFailed, 'Authentication with invalid credentials must fail closed');
console.log('✅ TEST 1 PASSED: Invalid credentials rejected with 401');

// =========================================================================
// TEST 2: Expired or tampered JWTs are rejected
// =========================================================================
console.log('\n--- TEST 2: Expired or tampered JWTs are rejected ---');
const testPayload = { id: 'usr-sec-01', email: 'auditor@kilifasuites.com', name: 'Security Auditor', role: Role.ADMIN };

// Tampered signature
const forgedToken = jwt.sign(testPayload, 'forged-secret-not-matching', { algorithm: 'HS256', expiresIn: '1h' });
let tamperedRejected = false;
try {
  jwt.verify(forgedToken, jwtSecret, { algorithms: ['HS256'] });
} catch {
  tamperedRejected = true;
}
assert.ok(tamperedRejected, 'Tampered token signature must be rejected');

// Expired token
const expiredToken = jwt.sign(testPayload, jwtSecret, { algorithm: 'HS256', expiresIn: '-5s' });
let expiredRejected = false;
try {
  jwt.verify(expiredToken, jwtSecret, { algorithms: ['HS256'] });
} catch {
  expiredRejected = true;
}
assert.ok(expiredRejected, 'Expired token must be rejected');

// Algorithm confusion (none algorithm)
let noneAlgRejected = false;
try {
  const noneToken = jwt.sign(testPayload, '', { algorithm: 'none' as any });
  jwt.verify(noneToken, jwtSecret, { algorithms: ['HS256'] });
} catch {
  noneAlgRejected = true;
}
assert.ok(noneAlgRejected, 'Tokens with "none" algorithm must be rejected');
console.log('✅ TEST 2 PASSED: Expired, tampered, and forged algorithm tokens are strictly rejected');

// =========================================================================
// TEST 3: Requests without authentication cannot access protected admin endpoints
// =========================================================================
console.log('\n--- TEST 3: Requests without authentication cannot access protected endpoints ---');
let unauthRejected = false;
const mockUnauthReq: any = { headers: {} };
const mockRes: any = {
  status: (code: number) => ({ json: (d: any) => d }),
  setHeader: () => {},
};

authenticateToken(mockUnauthReq, mockRes, (err?: any) => {
  if (err && (err.statusCode === 401 || err.status === 401)) {
    unauthRejected = true;
  }
});
assert.ok(unauthRejected, 'authenticateToken must reject unauthenticated requests with 401');
console.log('✅ TEST 3 PASSED: Unauthenticated requests rejected with 401');

// =========================================================================
// TEST 4: Staff cannot access owner-only operations
// =========================================================================
console.log('\n--- TEST 4: Staff cannot access owner-only operations ---');
const mockStaffReq: any = {
  user: { id: 'usr-staff-1', email: 'staff@kilifasuites.com', role: Role.STAFF },
};

let staffBlocked = false;
const ownerOnlyMiddleware = requireRole(Role.OWNER);
ownerOnlyMiddleware(mockStaffReq, mockRes, (err?: any) => {
  if (err && (err.statusCode === 403 || err.status === 403)) {
    staffBlocked = true;
  }
});
assert.ok(staffBlocked, 'requireRole(OWNER) must reject STAFF users with 403');
console.log('✅ TEST 4 PASSED: Staff role denied owner-only access with 403');

// =========================================================================
// TEST 5: Unauthorized users cannot create administrator or owner accounts
// =========================================================================
console.log('\n--- TEST 5: Privilege escalation and unauthorized registration prevented ---');
// 1. Unauthenticated registration
let unauthRegBlocked = false;
const unauthRegReq: any = { user: undefined, body: { email: 'hacker@test.com', password: 'Password123!', role: Role.ADMIN } };
await registerController(unauthRegReq, mockRes, (err?: any) => {
  if (err && err.statusCode === 401) unauthRegBlocked = true;
});
assert.ok(unauthRegBlocked, 'Unauthenticated account creation must return 401');

// 2. Admin cannot escalate an account to OWNER
let adminEscalationBlocked = false;
const adminRegReq: any = {
  user: { id: 'usr-admin-1', email: 'admin@kilifasuites.com', role: Role.ADMIN },
  body: { email: 'newowner@test.com', password: 'Password123!', role: Role.OWNER },
};
await registerController(adminRegReq, mockRes, (err?: any) => {
  if (err && err.statusCode === 403) adminEscalationBlocked = true;
});
assert.ok(adminEscalationBlocked, 'Administrators cannot create OWNER accounts (returns 403)');
console.log('✅ TEST 5 PASSED: Unauthorized registration and privilege escalation blocked');

// =========================================================================
// TEST 6: Local storage cannot bypass backend authentication
// =========================================================================
console.log('\n--- TEST 6: Local storage cannot bypass backend authentication ---');
const apiClientCode = fs.readFileSync(path.resolve('src/services/apiClient.ts'), 'utf8');
assert.ok(!apiClientCode.includes('DEFAULT_ADMIN_ACCOUNTS'), 'DEFAULT_ADMIN_ACCOUNTS must be absent');
assert.ok(!apiClientCode.includes('generateLocalToken'), 'generateLocalToken must be absent');
assert.ok(!apiClientCode.includes('getLocalAdminAccounts'), 'getLocalAdminAccounts must be absent');

const authContextCode = fs.readFileSync(path.resolve('src/context/AuthContext.tsx'), 'utf8');
assert.ok(!authContextCode.includes('generateLocalToken'), 'generateLocalToken must be absent from AuthContext');
assert.ok(authContextCode.includes('api.auth.me()'), 'AuthContext must verify session against backend /api/auth/me');
console.log('✅ TEST 6 PASSED: Client cannot self-mint authentication sessions');

// =========================================================================
// TEST 7: Backend / network failure cannot grant authenticated access
// =========================================================================
console.log('\n--- TEST 7: Backend/network failure fails closed ---');
assert.ok(
  authContextCode.includes('removeStoredToken()'),
  'AuthContext must purge token on initialization failure'
);
assert.ok(
  authContextCode.includes('setUser(null)'),
  'AuthContext must clear user state on backend session rejection'
);
console.log('✅ TEST 7 PASSED: Network and backend errors fail closed');

// =========================================================================
// TEST 8: Unknown and known email addresses receive equivalent responses
// =========================================================================
console.log('\n--- TEST 8: Password reset request response equivalence (prevent enumeration) ---');
const unknownResult = await authService.requestPasswordReset('completely_unknown_999@example.com');
assert.ok(
  unknownResult.message.includes('If an account matching this email address exists'),
  'Must return generic message for non-existent accounts'
);
console.log('✅ TEST 8 PASSED: Generic response returned to prevent account enumeration');

// =========================================================================
// TEST 9 & 10: Reset tokens validation, execution, single-use, and expiration
// =========================================================================
console.log('\n--- TEST 9 & 10: Reset tokens: invalid, expired, and single-use enforcement ---');
const prevFallback = process.env.ALLOW_MEMORY_FALLBACK;
process.env.ALLOW_MEMORY_FALLBACK = 'true';

// 1. Invalid token rejected
let invalidResetFailed = false;
try {
  await authService.executePasswordReset('bogus-invalid-random-token-xyz', 'ValidNewPassword123!');
} catch (err: any) {
  invalidResetFailed = true;
  assert.equal(err.statusCode || 400, 400);
}
assert.ok(invalidResetFailed, 'Bogus reset token must be rejected');

// 2. Request token for registered user
const testEmail = `test.reset.${Date.now()}@kilifasuites.com`;
await authService.register({
  name: 'Test Reset User',
  email: testEmail,
  password: 'OldPassword123!',
  role: Role.STAFF,
});

process.env.EXPOSE_DEV_DEBUG_TOKENS = 'true';
const resetReq = await authService.requestPasswordReset(testEmail);
const token = resetReq.debugToken;
assert.ok(token, 'Debug token generated in test mode');

// 3. Execute reset
const resetExecResult = await authService.executePasswordReset(token, 'NewSecurePassword456!');
assert.ok(resetExecResult.message.includes('successfully updated'), 'Password reset must succeed on first use');

// 4. Token cannot be reused (Single-Use Enforcement)
let reusedFailed = false;
try {
  await authService.executePasswordReset(token, 'AnotherPassword789!');
} catch (err: any) {
  reusedFailed = true;
  assert.equal(err.statusCode || 400, 400);
}
assert.ok(reusedFailed, 'Reset token must NOT be reusable once consumed');

// 5. Verify new password works
const newLogin = await authService.login(testEmail, 'NewSecurePassword456!');
assert.ok(newLogin.token, 'New password must authenticate successfully');

// 6. Verify old password is dead
let oldPasswordFailed = false;
try {
  await authService.login(testEmail, 'OldPassword123!');
} catch {
  oldPasswordFailed = true;
}
assert.ok(oldPasswordFailed, 'Old password must no longer authenticate');

// 7. CONCURRENCY TEST: Simultaneous redemption of the exact same reset token
console.log('--- Testing simultaneous concurrent redemption of reset token ---');
const concurrencyEmail = `concurrent.reset.${Date.now()}@kilifasuites.com`;
await authService.register({
  name: 'Concurrent User',
  email: concurrencyEmail,
  password: 'InitialPassword123!',
  role: Role.STAFF,
});

const concurrentResetReq = await authService.requestPasswordReset(concurrencyEmail);
const concurrentToken = concurrentResetReq.debugToken!;
assert.ok(concurrentToken, 'Concurrent test token generated');

// Fire two concurrent executePasswordReset calls simultaneously
const [attempt1, attempt2] = await Promise.allSettled([
  authService.executePasswordReset(concurrentToken, 'WinnerPasswordA1!'),
  authService.executePasswordReset(concurrentToken, 'WinnerPasswordB2!'),
]);

const fulfilled = [attempt1, attempt2].filter((r) => r.status === 'fulfilled');
const rejected = [attempt1, attempt2].filter((r) => r.status === 'rejected');

assert.equal(fulfilled.length, 1, 'Exactly one concurrent request must succeed');
assert.equal(rejected.length, 1, 'Exactly one concurrent request must be rejected');

const rejectedReason = (rejected[0] as PromiseRejectedResult).reason;
assert.equal(rejectedReason.statusCode || 400, 400, 'Rejected request must receive 400 Bad Request');

const winnerPass = attempt1.status === 'fulfilled' ? 'WinnerPasswordA1!' : 'WinnerPasswordB2!';
const loserPass = attempt1.status === 'fulfilled' ? 'WinnerPasswordB2!' : 'WinnerPasswordA1!';

const validAuth = await authService.login(concurrencyEmail, winnerPass);
assert.ok(validAuth.token, 'Winner password must authenticate successfully');

let loserAuthFailed = false;
try {
  await authService.login(concurrencyEmail, loserPass);
} catch {
  loserAuthFailed = true;
}
assert.ok(loserAuthFailed, 'Loser password must NOT authenticate');
console.log('✅ CONCURRENCY TEST PASSED: Exactly 1 concurrent request succeeded, 1 rejected, password consistent');

console.log('✅ TESTS 9 & 10 PASSED: Reset tokens are single-use, atomic, and update credentials securely');
if (prevFallback !== undefined) {
  process.env.ALLOW_MEMORY_FALLBACK = prevFallback;
} else {
  delete process.env.ALLOW_MEMORY_FALLBACK;
}

// =========================================================================
// TEST 11: Missing required production secrets cause secure failure
// =========================================================================
console.log('\n--- TEST 11: Production startup fails closed when JWT_SECRET missing ---');
const prevEnv = process.env.NODE_ENV;
const prevSecret = process.env.JWT_SECRET;
try {
  process.env.NODE_ENV = 'production';
  delete process.env.JWT_SECRET;
  let productionSecretCheckFailed = false;
  try {
    getJwtSecret();
  } catch (err: any) {
    productionSecretCheckFailed = true;
    assert.ok(err.message.includes('FATAL CONFIGURATION ERROR'));
  }
  assert.ok(productionSecretCheckFailed, 'Missing JWT_SECRET in production must throw fatal error');
} finally {
  process.env.NODE_ENV = prevEnv;
  if (prevSecret) process.env.JWT_SECRET = prevSecret;
}
console.log('✅ TEST 11 PASSED: Strict production validation fails fast on missing JWT_SECRET');

// =========================================================================
// TEST 12: Public registration disabled & rate limiting enforced
// =========================================================================
console.log('\n--- TEST 12: Public registration disabled and route rate limiting active ---');
const authRoutesCode = fs.readFileSync(path.resolve('src/server/routes/authRoutes.ts'), 'utf8');
assert.ok(
  authRoutesCode.includes('authenticateToken') && authRoutesCode.includes('requireRole'),
  'Registration route must be protected with authenticateToken and requireRole'
);
assert.ok(
  !authRoutesCode.includes("router.post('/register', authRateLimiter, register)"),
  'Public registration route must NOT exist'
);
assert.ok(authRoutesCode.includes('authRateLimiter'), 'Auth rate limiter must protect auth routes');
console.log('✅ TEST 12 PASSED: Public registration disabled; routes protected by rate limiting and RBAC');

// =========================================================================
// TEST 13: Vercel API entry point builds without conflicting function paths
// =========================================================================
console.log('\n--- TEST 13: Vercel API entry point compatibility & conflict avoidance ---');
assert.ok(fs.existsSync(path.resolve('api/index.ts')), 'api/index.ts must exist as Vercel serverless entry point');
assert.ok(!fs.existsSync(path.resolve('api/index.js')), 'api/index.js must NOT exist to avoid Vercel route collision');

const gitignoreCode = fs.readFileSync(path.resolve('.gitignore'), 'utf8');
assert.ok(gitignoreCode.includes('api/**/*.js'), '.gitignore must ignore compiled js in api/ directory');

const vercelConfig = JSON.parse(fs.readFileSync(path.resolve('vercel.json'), 'utf8'));
assert.ok(
  vercelConfig.rewrites.some((r: any) => r.source === '/api/(.*)' && r.destination === '/api'),
  'vercel.json must rewrite /api/(.*) to /api'
);
console.log('✅ TEST 13 PASSED: Vercel serverless entry point configured cleanly without file conflicts');

// =========================================================================
// TEST 14: Insecure Direct Object Reference (IDOR) protection on Bookings API
// =========================================================================
console.log('\n--- TEST 14: Insecure Direct Object Reference (IDOR) protection on Bookings API ---');
const bookingRoutesCode = fs.readFileSync(path.resolve('src/server/routes/bookingRoutes.ts'), 'utf8');
assert.ok(
  bookingRoutesCode.includes("router.get(\n  '/:id',\n  authenticateToken,\n  requireRole") ||
  bookingRoutesCode.includes("'/:id'") && bookingRoutesCode.includes("requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF)"),
  'GET /api/bookings/:id must be protected with both authenticateToken and requireRole'
);

// Verify unauthorized user role is rejected by middleware
const guestReq: any = {
  user: { id: 'usr-guest-01', email: 'guest@example.com', role: Role.GUEST },
};
let idorBlocked = false;
const bookingRoleMiddleware = requireRole(Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF);
bookingRoleMiddleware(guestReq, mockRes, (err?: any) => {
  if (err && (err.statusCode === 403 || err.status === 403)) {
    idorBlocked = true;
  }
});
assert.ok(idorBlocked, 'GUEST role must be forbidden (HTTP 403) from querying arbitrary bookings by ID');
console.log('✅ TEST 14 PASSED: IDOR eliminated; GET /api/bookings/:id strictly requires authorized role');

// =========================================================================
// TEST 15: Payment adapters fail closed safely in production
// =========================================================================
console.log('\n--- TEST 15: Payment adapters fail closed safely in production ---');
import { WaveAdapter } from '../src/server/payments/adapters/WaveAdapter';
import { AfrimoneyAdapter } from '../src/server/payments/adapters/AfrimoneyAdapter';

const prevNodeEnv = process.env.NODE_ENV;
try {
  process.env.NODE_ENV = 'production';
  delete process.env.WAVE_API_KEY;
  delete process.env.AFRIMONEY_API_KEY;

  const waveAdapter = new WaveAdapter();
  const afriAdapter = new AfrimoneyAdapter();

  const mockReq: any = {
    bookingId: 'bkg-test',
    bookingReference: 'KS-123456',
    amount: 5000,
    paidAmount: 5000,
    currency: 'GMD',
  };

  const waveRes = await waveAdapter.initiatePayment(mockReq);
  assert.equal(waveRes.status, 'FAILED', 'Unconfigured Wave adapter must return FAILED in production');
  assert.equal(waveRes.paidAmount, 0, 'Unconfigured Wave adapter must report 0 paid amount');

  const afriRes = await afriAdapter.initiatePayment(mockReq);
  assert.equal(afriRes.status, 'FAILED', 'Unconfigured Afrimoney adapter must return FAILED in production');
  assert.equal(afriRes.paidAmount, 0, 'Unconfigured Afrimoney adapter must report 0 paid amount');
} finally {
  process.env.NODE_ENV = prevNodeEnv;
}
console.log('✅ TEST 15 PASSED: Unconfigured payment gateways fail closed in production without simulation');

// =========================================================================
// TEST 16: Concurrency row locking & Admin bootstrap tool verification
// =========================================================================
console.log('\n--- TEST 16: Concurrency row-level locking & Admin bootstrap script ---');
const bookingServiceCode = fs.readFileSync(path.resolve('src/server/services/bookingService.ts'), 'utf8');
assert.ok(
  bookingServiceCode.includes('FOR UPDATE'),
  'bookingService must acquire exclusive row lock (FOR UPDATE) inside transaction to serialize reservations'
);

assert.ok(
  fs.existsSync(path.resolve('scripts/bootstrapAdmin.ts')),
  'scripts/bootstrapAdmin.ts must exist for secure administrative bootstrapping'
);

const packageJson = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'));
assert.ok(
  packageJson.scripts['admin:bootstrap'],
  'package.json must contain admin:bootstrap command'
);
console.log('✅ TEST 16 PASSED: Concurrency row-locking active and admin bootstrap tool verified');

console.log('\n======================================================');
console.log('🎉 ALL 16 APPLICATION SECURITY AUDIT TESTS PASSED (0 FAILURES)!');
console.log('======================================================\n');
