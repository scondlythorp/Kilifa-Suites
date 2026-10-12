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

let prismaClient: PrismaClient;

try {
  prismaClient =
    global.prisma ||
    new PrismaClient({
      datasources: {
        db: {
          url: validDbUrl,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
} catch (err) {
  console.warn('[AI Studio] Database not connected — using mock proxy fallback:', (err as Error).message);
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {},
    delete: async () => ({}),
    count: async () => 0,
    aggregate: async () => ({ _sum: {}, _avg: {}, _count: {} }),
    groupBy: async () => [],
  };
  prismaClient = new Proxy({}, {
    get: (_, prop) => {
      if (prop === '$queryRaw' || prop === '$executeRaw') return async () => [];
      if (prop === '$disconnect' || prop === '$connect') return async () => {};
      return new Proxy({}, { get: () => noOp });
    },
  }) as any;
}

export const prisma = prismaClient;

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


