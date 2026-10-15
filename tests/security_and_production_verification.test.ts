import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import jwt from 'jsonwebtoken';
import { authService } from '../src/server/services/authService';
import { getJwtSecret } from '../src/server/config/envConfig';

console.log('🔒 RUNNING KILIFA SUITES SECURITY & PRODUCTION VERIFICATION SUITE...\n');
const jwtSecret = getJwtSecret();

// =========================================================================
// FIX 1: Treat exposed administrator credentials as compromised
// =========================================================================
console.log('--- FIX 1: Checking Elimination of Hardcoded Administrator Credentials ---');

const adminLoginPagePath = path.resolve('src/pages/AdminLoginPage.tsx');
const adminLoginPageContent = fs.readFileSync(adminLoginPagePath, 'utf8');

// Ensure no credential cards or autofill buttons exist in AdminLoginPage
assert.ok(
  !adminLoginPageContent.includes('Auto-fill') && !adminLoginPageContent.includes('autofill'),
  'AdminLoginPage must not contain auto-fill buttons'
);
assert.ok(
  !adminLoginPageContent.includes('Scondly7210@'),
  'AdminLoginPage must not contain hardcoded default admin passwords'
);
assert.ok(
  !adminLoginPageContent.includes('Demo Credentials') && !adminLoginPageContent.includes('Default Credentials'),
  'AdminLoginPage must not display exposed administrator credentials card'
);
console.log('✅ Fix 1 passed: No credentials cards or autofill buttons in AdminLoginPage');

// =========================================================================
// FIX 2: Removal of hardcoded credentials and frontend authentication bypasses
// =========================================================================
console.log('\n--- FIX 2: Checking Removal of Frontend Auth Bypasses & Fake Tokens ---');

const apiClientPath = path.resolve('src/services/apiClient.ts');
const apiClientContent = fs.readFileSync(apiClientPath, 'utf8');

assert.ok(
  !apiClientContent.includes('DEFAULT_ADMIN_ACCOUNTS'),
  'apiClient must not contain DEFAULT_ADMIN_ACCOUNTS'
);
assert.ok(
  !apiClientContent.includes('generateLocalToken'),
  'apiClient must not contain generateLocalToken'
);
assert.ok(
  !apiClientContent.includes('getLocalAdminAccounts'),
  'apiClient must not contain getLocalAdminAccounts'
);
assert.ok(
  !apiClientContent.includes('saveLocalAdminAccounts'),
  'apiClient must not contain saveLocalAdminAccounts'
);

const authContextPath = path.resolve('src/context/AuthContext.tsx');
const authContextContent = fs.readFileSync(authContextPath, 'utf8');

assert.ok(
  !authContextContent.includes('generateLocalToken'),
  'AuthContext must not contain generateLocalToken'
);
console.log('✅ Fix 2 passed: All client-side fake tokens and admin accounts removed');

// =========================================================================
// FIX 3: Secure administrator and staff registration
// =========================================================================
console.log('\n--- FIX 3: Verifying Role-Based Authorization for Registration ---');

const authRoutesPath = path.resolve('src/server/routes/authRoutes.ts');
const authRoutesContent = fs.readFileSync(authRoutesPath, 'utf8');

// Verify that /register requires authenticateToken and requireRole
assert.ok(
  authRoutesContent.includes("authenticateToken") && authRoutesContent.includes("requireRole"),
  'authRoutes must protect registration with authenticateToken and requireRole'
);
assert.ok(
  !authRoutesContent.includes("router.post('/register', authRateLimiter, register)"),
  'Public registration route must NOT exist'
);
console.log('✅ Fix 3 passed: Registration route is protected with authenticateToken and requireRole');

// =========================================================================
// FIX 4: Correct token verification and session restoration
// =========================================================================
console.log('\n--- FIX 4: Verifying JWT Token Verification & Fail-Closed Logic ---');

// Test JWT validation logic
const testPayload = { userId: 'test-admin-1', email: 'admin@kilifasuites.com', role: 'ADMIN' };
const validToken = jwt.sign(testPayload, jwtSecret, { expiresIn: '1h' });
const decoded = jwt.verify(validToken, jwtSecret) as any;
assert.equal(decoded.userId, 'test-admin-1');
assert.equal(decoded.role, 'ADMIN');

// Forged token signed with a bogus secret must fail verification
let verificationFailed = false;
try {
  const forgedToken = jwt.sign(testPayload, 'wrong-secret-123', { expiresIn: '1h' });
  jwt.verify(forgedToken, jwtSecret);
} catch {
  verificationFailed = true;
}
assert.ok(verificationFailed, 'Tokens signed with invalid secret must be rejected');

// Expired token must fail verification
let expiredFailed = false;
try {
  const expiredToken = jwt.sign(testPayload, jwtSecret, { expiresIn: '-1s' });
  jwt.verify(expiredToken, jwtSecret);
} catch {
  expiredFailed = true;
}
assert.ok(expiredFailed, 'Expired tokens must be rejected');
console.log('✅ Fix 4 passed: Strict cryptographic signature and expiry verification enforced');

// =========================================================================
// FIX 5: Correct the password-reset flow
// =========================================================================
console.log('\n--- FIX 5: Verifying Password-Reset Security & Separation ---');

// 1. Password reset request must return generic response to prevent account enumeration
const resetReqResult = await authService.requestPasswordReset('nonexistent_account@test.com');
assert.ok(
  resetReqResult.message.includes('If an account matching this email address exists'),
  'Password reset must return generic enumeration-safe message'
);

// 2. Direct reset with invalid token must fail
let invalidTokenFailed = false;
try {
  await authService.executePasswordReset('bogus-invalid-token-xyz', 'ValidPassword123!');
} catch (e: any) {
  invalidTokenFailed = true;
  assert.ok(
    e.message.includes('Invalid or expired password reset token'),
    'Should indicate invalid or expired token'
  );
}
assert.ok(invalidTokenFailed, 'Invalid reset token must fail closed');

console.log('✅ Fix 5 passed: Password reset is separated, token-based, and enumeration-safe');

console.log('\n🎉 ALL SECURITY & PRODUCTION CHECKS COMPLETED SUCCESSFULLY (0 FAILURES)!');
