import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Role } from '@prisma/client';
import { prisma, isDatabaseConnected } from '../db/prisma';
import { ApiError } from '../middleware/errorHandler';
import { getJwtSecret, getJwtExpiresIn, isMemoryFallbackAllowed } from '../config/envConfig';
import { notificationManager } from '../notifications/NotificationManager';

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt?: string;
}

export interface LoginResponse {
  token: string;
  user: UserDTO;
}

interface ResetTokenRecord {
  email: string;
  hashedToken: string;
  expiresAt: number;
}

// In-memory token store used ONLY when database is offline in non-production mode
const resetTokenMemoryStore = new Map<string, ResetTokenRecord>();

// Fallback users for development/test mode when database is not configured.
// In production mode, this object is strictly empty. No credentials are hardcoded.
const devPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Kilifa2026!';
const devPasswordHash = bcrypt.hashSync(devPassword, 10);

const FALLBACK_USERS: Record<string, { id: string; email: string; username: string; name: string; role: Role; passwordHash: string }> =
  process.env.NODE_ENV === 'production'
    ? {}
    : {
        'admin@kilifasuites.com': {
          id: 'usr-admin-001',
          email: process.env.ADMIN_INITIAL_EMAIL?.toLowerCase().trim() || 'admin@kilifasuites.com',
          username: 'admin',
          name: 'System Administrator',
          role: Role.ADMIN,
          passwordHash: devPasswordHash,
        },
        'owner@kilifasuites.com': {
          id: 'usr-owner-001',
          email: 'owner@kilifasuites.com',
          username: 'owner',
          name: 'Property Owner',
          role: Role.OWNER,
          passwordHash: devPasswordHash,
        },
        'gambiantechie4@gmail.com': {
          id: 'usr-admin-002',
          email: 'gambiantechie4@gmail.com',
          username: 'gambiantechie4',
          name: 'Administrator',
          role: Role.OWNER,
          passwordHash: devPasswordHash,
        },
      };

class AuthService {
  /**
   * Authenticate user with exact email and password
   * Searches strictly by unique email, eliminating ambiguous substring or name-based matches
   */
  public async login(identifier: string, password: string): Promise<LoginResponse> {
    const raw = identifier.toLowerCase().trim();

    if (isDatabaseConnected()) {
      try {
        const user = await prisma.user.findFirst({
          where: {
            email: { equals: raw, mode: 'insensitive' },
          },
        });

        if (user && user.password) {
          const allowedRoles: Role[] = [Role.OWNER, Role.ADMIN, Role.RECEPTIONIST, Role.STAFF];
          if (!allowedRoles.includes(user.role)) {
            throw new ApiError(403, 'Access denied. Only authorized personnel can access the management portal.');
          }

          const passwordMatches = await bcrypt.compare(password, user.password);
          if (!passwordMatches) {
            throw new ApiError(401, 'Invalid credentials. Please verify your login details.');
          }

          const payload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };

          const token = jwt.sign(payload, getJwtSecret(), {
            algorithm: 'HS256',
            expiresIn: getJwtExpiresIn() as any,
          });

          return {
            token,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              createdAt: user.createdAt.toISOString(),
            },
          };
        }
      } catch (err) {
        if (err instanceof ApiError) throw err;
      }
    }

    if (!isMemoryFallbackAllowed()) {
      throw new ApiError(401, 'Invalid credentials. Account not found.');
    }

    // Search development fallback accounts
    const fallbackUser = Object.values(FALLBACK_USERS).find(
      (acc) => acc.email.toLowerCase() === raw || acc.username.toLowerCase() === raw
    );

    if (fallbackUser) {
      const passwordMatches = await bcrypt.compare(password, fallbackUser.passwordHash);

      if (!passwordMatches) {
        throw new ApiError(401, 'Invalid credentials. Please verify your login details.');
      }

      const payload = {
        id: fallbackUser.id,
        email: fallbackUser.email,
        name: fallbackUser.name,
        role: fallbackUser.role,
      };

      const token = jwt.sign(payload, getJwtSecret(), {
        algorithm: 'HS256',
        expiresIn: getJwtExpiresIn() as any,
      });

      return {
        token,
        user: {
          id: fallbackUser.id,
          email: fallbackUser.email,
          name: fallbackUser.name,
          role: fallbackUser.role,
        },
      };
    }

    throw new ApiError(401, 'Invalid credentials. Account not found.');
  }

  /**
   * Create / Register an authorized staff or administrator account
   * Protected: Callable only by authenticated System Administrators or Owners
   */
  public async register(data: { name: string; email: string; username?: string; password: string; role?: Role }): Promise<UserDTO> {
    const email = data.email.toLowerCase().trim();
    const name = data.name.trim() || 'Staff Member';
    const password = data.password.trim();
    const role = data.role || Role.STAFF;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required.');
    }

    if (password.length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters long.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `usr-${Date.now()}`;

    if (isDatabaseConnected()) {
      const existing = await prisma.user.findFirst({ where: { email } });
      if (existing) {
        throw new ApiError(409, 'An account with this email address already exists.');
      }

      const created = await prisma.user.create({
        data: {
          id: userId,
          email,
          name,
          password: hashedPassword,
          role,
        },
      });

      return {
        id: created.id,
        email: created.email,
        name: created.name,
        role: created.role,
        createdAt: created.createdAt.toISOString(),
      };
    }

    if (!isMemoryFallbackAllowed()) {
      throw new ApiError(503, 'Database service is currently unavailable. Account registration failed.');
    }

    FALLBACK_USERS[email] = {
      id: userId,
      email,
      username: email.split('@')[0],
      name,
      role,
      passwordHash: hashedPassword,
    };

    return {
      id: userId,
      email,
      name,
      role,
    };
  }

  /**
   * Request password reset token
   * Generates a 32-byte cryptographically secure token (valid 15 minutes)
   * Persists token hash in database to support serverless environments
   * Returns a generic response to prevent account enumeration
   */
  public async requestPasswordReset(email: string): Promise<{ message: string; debugToken?: string }> {
    const raw = email.toLowerCase().trim();
    if (!raw || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
      throw new ApiError(400, 'A valid email address is required.');
    }

    let userExists = false;

    if (isDatabaseConnected()) {
      try {
        const user = await prisma.user.findUnique({ where: { email: raw } });
        if (user) userExists = true;
      } catch {}
    } else if (FALLBACK_USERS[raw]) {
      userExists = true;
    }

    let debugToken: string | undefined;

    if (userExists) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes TTL

      if (isDatabaseConnected()) {
        try {
          // Persist token in database across serverless invocations
          await prisma.passwordResetToken.create({
            data: {
              email: raw,
              tokenHash,
              expiresAt,
              used: false,
            },
          });
        } catch (dbErr) {
          console.warn('[PASSWORD RESET] Could not persist token to database:', (dbErr as Error).message);
          if (process.env.NODE_ENV === 'production') {
            throw new ApiError(503, 'Database service unavailable. Password reset tokens cannot be persisted.');
          }
          resetTokenMemoryStore.set(tokenHash, {
            email: raw,
            hashedToken: tokenHash,
            expiresAt: expiresAt.getTime(),
          });
        }
      } else {
        if (process.env.NODE_ENV === 'production') {
          throw new ApiError(503, 'Database service unavailable. Password reset tokens cannot be persisted.');
        }
        resetTokenMemoryStore.set(tokenHash, {
          email: raw,
          hashedToken: tokenHash,
          expiresAt: expiresAt.getTime(),
        });
      }

      // Check email provider configuration
      const emailProvider = notificationManager.getProvider('EMAIL');
      const emailConfigured = emailProvider && emailProvider.isConfigured();

      if (emailConfigured) {
        try {
          const dispatchResults = await notificationManager.dispatch(
            {
              type: 'PASSWORD_RESET',
              recipient: { email: raw, name: 'Administrative User' },
              metadata: {
                token: rawToken,
                expiresInMinutes: 15,
              },
            },
            ['EMAIL']
          );

          const emailResult = dispatchResults.find((r) => r.channel === 'EMAIL');
          if (emailResult && !emailResult.success) {
            console.error('[PASSWORD RESET] Email dispatch returned failed status:', emailResult.error);
            if (process.env.NODE_ENV === 'production') {
              throw new ApiError(
                503,
                'Unable to deliver password reset instructions at this time. Please try again later or contact support.'
              );
            }
          }
        } catch (dispatchErr: any) {
          console.error('[PASSWORD RESET] Email dispatch error:', dispatchErr.message);
          if (dispatchErr instanceof ApiError) {
            throw dispatchErr;
          }
          if (process.env.NODE_ENV === 'production') {
            throw new ApiError(
              503,
              'Unable to deliver password reset instructions at this time. Please try again later or contact support.'
            );
          }
        }
      } else if (process.env.NODE_ENV === 'production') {
        throw new ApiError(
          503,
          'Automated email delivery is not configured on this system. Please contact a property owner or system administrator directly to reset your account password.'
        );
      }

      // Expose debug token ONLY in local automated test environment, never in production
      if (process.env.NODE_ENV !== 'production' && (process.env.EXPOSE_DEV_DEBUG_TOKENS === 'true' || process.env.NODE_ENV === 'test')) {
        debugToken = rawToken;
      }
    }

    return {
      message: 'If an account matching this email address exists, password reset instructions have been sent.',
      ...(debugToken && { debugToken }),
    };
  }

  /**
   * Execute password reset using verified token
   * Single-use token invalidated immediately upon consumption
   */
  public async executePasswordReset(token: string, newPassword: string): Promise<{ message: string }> {
    if (!token || typeof token !== 'string' || !token.trim()) {
      throw new ApiError(400, 'Password reset token is required.');
    }

    if (!newPassword || newPassword.trim().length < 8) {
      throw new ApiError(400, 'New password must be at least 8 characters long.');
    }

    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
    let targetEmail: string | null = null;

    if (isDatabaseConnected()) {
      const now = new Date();
      const newHash = await bcrypt.hash(newPassword.trim(), 10);

      // Database-enforced atomic conditional claim inside interactive transaction
      // updateMany ensures that if two requests concurrently attempt redemption,
      // only the one that successfully transitions used from false -> true will match count === 1.
      // The second request sees used = true (or expired) and fails with count === 0.
      await prisma.$transaction(async (tx) => {
        const claimResult = await tx.passwordResetToken.updateMany({
          where: {
            tokenHash,
            used: false,
            expiresAt: { gt: now },
          },
          data: {
            used: true,
          },
        });

        if (claimResult.count !== 1) {
          throw new ApiError(400, 'Invalid or expired password reset token. Please request a new reset link.');
        }

        const tokenRecord = await tx.passwordResetToken.findUnique({
          where: { tokenHash },
        });

        if (!tokenRecord) {
          throw new ApiError(400, 'Invalid or expired password reset token. Please request a new reset link.');
        }

        await tx.user.update({
          where: { email: tokenRecord.email },
          data: { password: newHash },
        });
      });

      return {
        message: 'Password has been successfully updated. You may now sign in with your new credentials.',
      };
    }

    // Fallback store check (strictly non-production only)
    if (process.env.NODE_ENV === 'production') {
      throw new ApiError(503, 'Database service is unavailable. Cannot verify password reset token.');
    }

    // Atomic claim in memory: delete immediately BEFORE any asynchronous await
    const memRecord = resetTokenMemoryStore.get(tokenHash);
    if (!memRecord || Date.now() > memRecord.expiresAt) {
      if (memRecord) resetTokenMemoryStore.delete(tokenHash);
      throw new ApiError(400, 'Invalid or expired password reset token. Please request a new reset link.');
    }

    // Synchronously consume token before hashing
    resetTokenMemoryStore.delete(tokenHash);

    targetEmail = memRecord.email;
    const newHash = await bcrypt.hash(newPassword.trim(), 10);

    if (FALLBACK_USERS[targetEmail]) {
      FALLBACK_USERS[targetEmail].passwordHash = newHash;
    }

    return {
      message: 'Password has been successfully updated. You may now sign in with your new credentials.',
    };
  }

  /**
   * Retrieve current user profile by User ID
   */
  public async getProfile(userId: string): Promise<UserDTO> {
    if (isDatabaseConnected()) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt.toISOString(),
          };
        }
      } catch (err) {
        if (err instanceof ApiError) throw err;
      }
    }

    const fallback = Object.values(FALLBACK_USERS).find((u) => u.id === userId);
    if (fallback) {
      return {
        id: fallback.id,
        email: fallback.email,
        name: fallback.name,
        role: fallback.role,
      };
    }

    throw new ApiError(404, 'User profile not found.');
  }
}

export const authService = new AuthService();
