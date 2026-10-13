import { PrismaClient } from '@prisma/client';
import { getSanitizedDatabaseUrl, isDatabaseConfigured } from '../config/envConfig';

declare global {
  // Allow global prisma across hot reloading in development
  var prisma: PrismaClient | undefined;
}

const validDbUrl = getSanitizedDatabaseUrl();

let prismaClient: PrismaClient;

if (validDbUrl) {
  try {
    prismaClient =
      global.prisma ||
      new PrismaClient({
        datasources: {
          db: {
            url: validDbUrl,
          },
        },
        log: [
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'warn' },
        ],
      });

    if ((prismaClient as any).$on) {
      (prismaClient as any).$on('error', () => {});
      (prismaClient as any).$on('warn', () => {});
    }
  } catch (err) {
    prismaClient = createNoOpProxy();
  }
} else {
  prismaClient = createNoOpProxy();
}

function createNoOpProxy(): PrismaClient {
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
  return new Proxy({}, {
    get: (_, prop) => {
      if (prop === '$queryRaw' || prop === '$executeRaw') return async () => [];
      if (prop === '$disconnect' || prop === '$connect') return async () => {};
      return new Proxy({}, { get: () => noOp });
    },
  }) as any;
}

export const prisma = prismaClient;
export { isDatabaseConfigured };

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

let isConnected = false;
let lastCheckTime = 0;
const CHECK_CACHE_TTL = 10000; // 10 seconds cache to prevent query flooding

export async function checkDatabaseConnection(force = false): Promise<boolean> {
  const now = Date.now();
  if (!force && now - lastCheckTime < CHECK_CACHE_TTL && lastCheckTime > 0) {
    return isConnected;
  }

  const rawDb = process.env.DATABASE_URL?.trim();
  if (!rawDb || (!rawDb.startsWith('postgresql://') && !rawDb.startsWith('postgres://'))) {
    isConnected = false;
    lastCheckTime = now;
    return false;
  }

  try {
    // 1.5-second timeout to check availability without hanging
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 1500)),
    ]);
    isConnected = true;
    lastCheckTime = now;
    return true;
  } catch {
    isConnected = false;
    lastCheckTime = now;
    return false;
  }
}

export function isDatabaseConnected(): boolean {
  return isConnected;
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


