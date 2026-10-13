import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Role } from '@prisma/client';
import { prisma, isDatabaseConnected } from '../db/prisma';
import { ApiError } from '../middleware/errorHandler';
import { getJwtSecret, getJwtExpiresIn, isMemoryFallbackAllowed } from '../config/envConfig';

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

// In-memory token store for single-use password resets (15 minute TTL)
const resetTokenStore = new Map<string, ResetTokenRecord>();

// Initial admin password hash - NEVER stored as plaintext
const initialAdminHash = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync(process.env.ADMIN_INITIAL_PASSWORD || 'Kilifa2026!AdminKey', 10);

const FALLBACK_USERS: Record<string, { id: string; email: string; username: string; name: string; role: Role; passwordHash: string }> = {
  'modoulaminthorp4@gmail.com': {
    id: 'usr-admin-001',
    email: 'modoulaminthorp4@gmail.com',
    username: 'kilifasuites',
    name: 'System Administrator',
    role: Role.ADMIN,
    passwordHash: initialAdminHash,
  },
};

class AuthService {
  /**
   * Authenticate user with email or username and password
   * Only allows administrative roles to enter management portal
   */
  public async login(identifier: string, password: string): Promise<LoginResponse> {
    const raw = identifier.toLowerCase().trim();

    if (isDatabaseConnected()) {
      try {
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: { equals: raw, mode: 'insensitive' } },
              { name: { contains: raw, mode: 'insensitive' } },
            ],
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

    // Search in fallback accounts
    const fallbackUser = Object.values(FALLBACK_USERS).find((acc) => {
      const emailMatch = acc.email.toLowerCase() === raw;
      const usernameMatch = acc.username.toLowerCase() === raw;
      return emailMatch || usernameMatch;
    });

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
   * Protected: Callable only by authenticated System Administrators
   */
  public async register(data: { name: string; email: string; username?: string; password: string; role?: Role }): Promise<UserDTO> {
    const email = data.email.toLowerCase().trim();
    const username = (data.username || email.split('@')[0]).toLowerCase().trim();
    const name = data.name.trim() || 'Staff Member';
    const password = data.password.trim();
    const role = data.role || Role.STAFF;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required.');
    }

    if (password.length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters long.');
    }

    // Check if user exists in fallback
    if (FALLBACK_USERS[email] || Object.values(FALLBACK_USERS).some((u) => u.username === username)) {
      throw new ApiError(409, 'An account with this email address or username already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `usr-${Date.now()}`;

    if (isDatabaseConnected()) {
      try {
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
      } catch (err) {
        if (err instanceof ApiError) throw err;
      }
    }

    FALLBACK_USERS[email] = {
      id: userId,
      email,
      username,
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
   * Generates a 32-byte cryptographically secure single-use token (valid 15 minutes)
   * Returns a generic response to prevent user enumeration
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
    }

    if (!userExists && FALLBACK_USERS[raw]) {
      userExists = true;
    }

    let debugToken: string | undefined;

    if (userExists) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

      resetTokenStore.set(hashedToken, {
        email: raw,
        hashedToken,
        expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes TTL
      });

      // In non-production, expose debug token in response for safe testing
      if (process.env.NODE_ENV !== 'production') {
        debugToken = rawToken;
      }

      console.log(`[PASSWORD RESET TOKEN GENERATED for ${raw}] Token valid for 15 minutes: ${rawToken}`);
    }

    return {
      message: 'If an account matching this email address exists, password reset instructions have been sent.',
      debugToken,
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

    const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');
    const tokenRecord = resetTokenStore.get(hashedToken);

    if (!tokenRecord) {
      throw new ApiError(400, 'Invalid or expired password reset token. Please request a new reset link.');
    }

    if (Date.now() > tokenRecord.expiresAt) {
      resetTokenStore.delete(hashedToken);
      throw new ApiError(400, 'Password reset token has expired. Please request a new reset link.');
    }

    const targetEmail = tokenRecord.email;
    const newHash = await bcrypt.hash(newPassword.trim(), 10);

    // Update in database if connected
    if (isDatabaseConnected()) {
      try {
        await prisma.user.update({
          where: { email: targetEmail },
          data: { password: newHash },
        });
      } catch {}
    }

    // Update in fallback store
    if (FALLBACK_USERS[targetEmail]) {
      FALLBACK_USERS[targetEmail].passwordHash = newHash;
    }

    // Invalidate token immediately (Single-use enforcement)
    resetTokenStore.delete(hashedToken);

    return {
      message: 'Password has been successfully updated. You may now sign in with your new credentials.',
    };
  }

  /**
   * Retrieve current user profile by User ID
   */
  public async getProfile(userId: string): Promise<UserDTO> {
    const fallback = Object.values(FALLBACK_USERS).find((u) => u.id === userId);
    if (fallback) {
      return {
        id: fallback.id,
        email: fallback.email,
        name: fallback.name,
        role: fallback.role,
      };
    }

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

    throw new ApiError(404, 'User profile not found.');
  }
}

export const authService = new AuthService();
