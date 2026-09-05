import { PrismaClient } from '@prisma/client';
import { getSanitizedDatabaseUrl } from '../config/envConfig';

declare global {
  // Allow global prisma across hot reloading in development
  var prisma: PrismaClient | undefined;
}

const validDbUrl = getSanitizedDatabaseUrl();

// Ensure process.env.DATABASE_URL matches the sanitized valid URL
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
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
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

// Graceful cleanup on server shutdown
const handleShutdown = async () => {
  try {
    await prisma.$disconnect();
  } catch (err) {
    // Ignore during shutdown
  }
};

process.once('beforeExit', handleShutdown);
process.once('SIGINT', handleShutdown);
process.once('SIGTERM', handleShutdown);


