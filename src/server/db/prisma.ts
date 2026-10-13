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

let isConnected = false;
let hasCheckedConnection = false;

export async function checkDatabaseConnection(): Promise<boolean> {
  if (hasCheckedConnection) {
    return isConnected;
  }

  const rawDb = process.env.DATABASE_URL?.trim();
  if (!rawDb || (!rawDb.startsWith('postgresql://') && !rawDb.startsWith('postgres://'))) {
    isConnected = false;
    hasCheckedConnection = true;
    return false;
  }

  try {
    // 1.5-second timeout to check availability without hanging
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 1500)),
    ]);
    isConnected = true;
    hasCheckedConnection = true;
    return true;
  } catch {
    isConnected = false;
    hasCheckedConnection = true;
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


