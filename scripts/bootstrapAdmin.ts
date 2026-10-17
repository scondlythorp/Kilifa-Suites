/**
 * Kilifa Suites - Secure Administrator Bootstrap CLI Script
 *
 * Used by the property owner or DevOps engineers to securely provision
 * or reset the initial administrative account in PostgreSQL.
 *
 * Usage:
 *   npx tsx scripts/bootstrapAdmin.ts --email=owner@kilifasuites.com --password=YourSecurePassword123! --name="Property Owner" --role=OWNER
 * Or using environment variables:
 *   ADMIN_BOOTSTRAP_EMAIL=owner@kilifasuites.com ADMIN_BOOTSTRAP_PASSWORD=YourPassword123! npx tsx scripts/bootstrapAdmin.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function parseArgs(): Record<string, string> {
  const args: Record<string, string> = {};
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--')) {
      const [key, ...valueParts] = arg.slice(2).split('=');
      args[key] = valueParts.join('=');
    }
  }
  return args;
}

async function bootstrapAdmin() {
  const args = parseArgs();

  const email = (args.email || process.env.ADMIN_BOOTSTRAP_EMAIL || '').trim().toLowerCase();
  const password = (args.password || process.env.ADMIN_BOOTSTRAP_PASSWORD || '').trim();
  const name = (args.name || process.env.ADMIN_BOOTSTRAP_NAME || 'System Administrator').trim();
  const rawRole = (args.role || process.env.ADMIN_BOOTSTRAP_ROLE || 'OWNER').trim().toUpperCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('❌ Error: A valid email address is required (--email=user@example.com or ADMIN_BOOTSTRAP_EMAIL)');
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error('❌ Error: Password must be at least 8 characters long (--password=... or ADMIN_BOOTSTRAP_PASSWORD)');
    process.exit(1);
  }

  const validRoles: Role[] = [Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF];
  if (!validRoles.includes(rawRole as Role)) {
    console.error(`❌ Error: Invalid role '${rawRole}'. Must be one of: ${validRoles.join(', ')}`);
    process.exit(1);
  }

  const role = rawRole as Role;

  console.log(`🔐 [BOOTSTRAP] Provisioning administrative user: ${email} (${role})...`);

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        password: passwordHash,
        role,
      },
      create: {
        email,
        name,
        password: passwordHash,
        role,
      },
    });

    console.log(`✅ [BOOTSTRAP SUCCESS] Administrative account '${user.email}' (ID: ${user.id}) successfully configured with role '${user.role}'.`);
    console.log('🔒 You may now sign in to the management portal at /admin using these credentials.');
  } catch (err: any) {
    console.error('❌ [BOOTSTRAP ERROR] Database operation failed:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

bootstrapAdmin().catch((err) => {
  console.error('Fatal bootstrap exception:', err);
  process.exit(1);
});
