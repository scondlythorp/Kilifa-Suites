import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Phase 0.6: Enforce Strict JWT Secret Validation
 * Fails fast at runtime/startup in production if JWT_SECRET is missing or set to a known placeholder.
 */
export function getJwtSecret(): string {
  const isProd = process.env.NODE_ENV === 'production';
  let secret = process.env.JWT_SECRET?.trim();
  if (secret && ((secret.startsWith('"') && secret.endsWith('"')) || (secret.startsWith("'") && secret.endsWith("'")))) {
    secret = secret.slice(1, -1).trim();
  }
  const placeholder = 'kilifa_suites_jwt_secret_key_2026_super_secure';

  if (isProd) {
    if (!secret || secret === placeholder) {
      throw new Error(
        '[FATAL CONFIGURATION ERROR] In production mode, JWT_SECRET must be explicitly set to a strong, non-default secret key in the environment. Application startup terminated.'
      );
    }
    return secret;
  }

  if (secret) {
    return secret;
  }

  // Development-only isolated fallback key with explicit console warning
  console.warn(
    '[DEV SECURITY NOTICE] No JWT_SECRET configured in environment. Using isolated local dev key. This MUST be set before production deployment.'
  );
  return 'kilifa_local_dev_only_jwt_key_must_be_set_in_production_2026';
}

export function getJwtExpiresIn(): string | number {
  let raw = process.env.JWT_EXPIRES_IN?.trim();
  if (!raw) return '7d';
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    raw = raw.slice(1, -1).trim();
  }
  if (/^\d+$/.test(raw)) {
    return parseInt(raw, 10);
  }
  // Convert singular unit strings that ms library does not parse (e.g., "12 month" -> "360d")
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

/**
 * Phase 1 Persistence Policy:
 * Determines whether services are permitted to fall back to volatile in-memory storage
 * when the primary PostgreSQL database is unreachable.
 *
 * In production: Strictly false (ALLOW_MEMORY_FALLBACK=false by default).
 * In development: Allowed only for resilient development prototyping when explicitly enabled.
 */
export function isMemoryFallbackAllowed(): boolean {
  if (process.env.NODE_ENV === 'production') {
    return process.env.ALLOW_MEMORY_FALLBACK === 'true';
  }
  if (process.env.ALLOW_MEMORY_FALLBACK === 'false') {
    return false;
  }
  // In development/test mode, allow in-memory fallback for prototyping
  return true;
}

/**
 * Phase 1.4: Sanitize Database URL to ensure valid postgres protocol prefix
 */
export function getSanitizedDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL?.trim();
  const defaultUrl = 'postgresql://postgres:postgres@localhost:5432/kilifa_suites?schema=public';
  if (raw && (raw.startsWith('postgresql://') || raw.startsWith('postgres://'))) {
    return raw;
  }
  return defaultUrl;
}
