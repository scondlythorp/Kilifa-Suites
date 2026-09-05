import { PrismaClient } from '@prisma/client';

declare global {
  // Allow global prisma across hot reloading in development
  var prisma: PrismaClient | undefined;
}

const defaultDbUrl = 'postgresql://postgres:postgres@localhost:5432/kilifa_suites?schema=public';
const rawDbUrl = process.env.DATABASE_URL?.trim();
const validDbUrl = (rawDbUrl && (rawDbUrl.startsWith('postgresql://') || rawDbUrl.startsWith('postgres://')))
  ? rawDbUrl
  : defaultDbUrl;

if (!process.env.DATABASE_URL || (!process.env.DATABASE_URL.startsWith('postgresql://') && !process.env.DATABASE_URL.startsWith('postgres://'))) {
  process.env.DATABASE_URL = validDbUrl;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: validDbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.warn('[PRISMA DB WARNING] Unable to connect to PostgreSQL instance via PrismaClient:', (error as Error).message);
    return false;
  }
}

