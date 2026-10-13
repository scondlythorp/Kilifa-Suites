import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
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

// Fallback accounts for development & testing when database is pending initialization
// ONLY allow role System Admin (ADMIN)
const FALLBACK_USERS: Record<string, { id: string; email: string; username: string; name: string; role: Role; pass: string }> = {
  'modoulaminthorp4@gmail.com': {
    id: 'usr-admin-001',
    email: 'modoulaminthorp4@gmail.com',
    username: 'kilifasuites',
    name: 'System Administrator',
    role: Role.ADMIN,
    pass: 'Scondly7210@',
  },
};

class AuthService {
  /**
   * Authenticate user with email or username and password
   * Only allows System Admin role
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
          if (user.role !== Role.ADMIN) {
            throw new ApiError(403, 'Access denied. Only System Admin accounts can access the management portal.');
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

    // Flexible fallback account search by email, username, or role name for System Admin
    const fallbackUser = Object.values(FALLBACK_USERS).find((acc) => {
      const emailMatch = acc.email.toLowerCase() === raw;
      const usernameMatch = acc.username.toLowerCase() === raw;
      const adminAliasMatch = raw === 'admin' || raw === 'system admin';
      return emailMatch || usernameMatch || adminAliasMatch;
    });

    if (fallbackUser) {
      if (fallbackUser.role !== Role.ADMIN) {
        throw new ApiError(403, 'Access denied. Only System Admin accounts can access the management portal.');
      }

      // Validate password strictly
      const isPassValid = password === fallbackUser.pass;

      if (!isPassValid) {
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
   * Create / Register a new System Admin account
   */
  public async register(data: { name: string; email: string; username?: string; password: string }): Promise<LoginResponse> {
    const email = data.email.toLowerCase().trim();
    const username = (data.username || email.split('@')[0]).toLowerCase().trim();
    const name = data.name.trim() || 'System Administrator';
    const password = data.password.trim();

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required.');
    }

    if (password.length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters long.');
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `usr-admin-${Date.now()}`;

    // Check if user already exists in memory fallback
    if (FALLBACK_USERS[email] || Object.values(FALLBACK_USERS).some((u) => u.username === username)) {
      throw new ApiError(409, 'An account with this email address or username already exists.');
    }

    if (isDatabaseConnected()) {
      try {
        const existing = await prisma.user.findFirst({
          where: { email },
        });

        if (existing) {
          throw new ApiError(409, 'An account with this email address already exists.');
        }

        const created = await prisma.user.create({
          data: {
            id: userId,
            email,
            name,
            password: hashedPassword,
            role: Role.ADMIN,
          },
        });

        const payload = {
          id: created.id,
          email: created.email,
          name: created.name,
          role: created.role,
        };

        const token = jwt.sign(payload, getJwtSecret(), {
          expiresIn: getJwtExpiresIn() as any,
        });

        return {
          token,
          user: {
            id: created.id,
            email: created.email,
            name: created.name,
            role: created.role,
            createdAt: created.createdAt.toISOString(),
          },
        };
      } catch (err) {
        if (err instanceof ApiError) throw err;
      }
    }

    // Save in memory fallback
    FALLBACK_USERS[email] = {
      id: userId,
      email,
      username,
      name,
      role: Role.ADMIN,
      pass: password,
    };

    const payload = {
      id: userId,
      email,
      name,
      role: Role.ADMIN,
    };

    const token = jwt.sign(payload, getJwtSecret(), {
      expiresIn: getJwtExpiresIn() as any,
    });

    return {
      token,
      user: {
        id: userId,
        email,
        name,
        role: Role.ADMIN,
      },
    };
  }

  /**
   * Reset / Forgot password for a System Admin account
   */
  public async resetPassword(data: { email: string; newPassword: string }): Promise<{ message: string }> {
    const raw = data.email.toLowerCase().trim();
    const newPassword = data.newPassword.trim();

    if (!raw || !newPassword) {
      throw new ApiError(400, 'Email address and new password are required.');
    }

    if (newPassword.length < 6) {
      throw new ApiError(400, 'New password must be at least 6 characters long.');
    }

    // 1. Check in-memory fallback users first
    const fallbackUser = Object.values(FALLBACK_USERS).find((acc) => {
      return (
        acc.email.toLowerCase() === raw ||
        acc.username.toLowerCase() === raw ||
        (raw === 'kilifasuites' && acc.username === 'kilifasuites')
      );
    });

    if (fallbackUser) {
      fallbackUser.pass = newPassword;
      return { message: 'Password has been successfully updated. You may now log in.' };
    }

    // 2. If database is connected, query and update in Prisma
    if (isDatabaseConnected()) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      try {
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: { equals: raw, mode: 'insensitive' } },
              { name: { contains: raw, mode: 'insensitive' } },
            ],
          },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
          });

          return { message: 'Password has been successfully updated. You may now log in.' };
        }
      } catch (err) {
        if (err instanceof ApiError) throw err;
      }
    }

    throw new ApiError(404, 'No account found matching this email or username.');
  }

  /**
   * Retrieve current user profile by User ID
   */
  public async getProfile(userId: string): Promise<UserDTO> {
    // 1. Check in-memory fallback users first
    const fallback = Object.values(FALLBACK_USERS).find((u) => u.id === userId);
    if (fallback) {
      return {
        id: fallback.id,
        email: fallback.email,
        name: fallback.name,
        role: fallback.role,
      };
    }

    // 2. Query Prisma only if database is connected
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
