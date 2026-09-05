import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../db/prisma';
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
const FALLBACK_USERS: Record<string, { id: string; email: string; name: string; role: Role; pass: string }> = {
  'owner@kilifasuites.com': {
    id: 'usr-owner-001',
    email: 'owner@kilifasuites.com',
    name: 'Alhaji Kilifa',
    role: Role.OWNER,
    pass: 'KilifaPass2026!',
  },
  'admin@kilifasuites.com': {
    id: 'usr-admin-001',
    email: 'admin@kilifasuites.com',
    name: 'System Administrator',
    role: Role.ADMIN,
    pass: 'KilifaPass2026!',
  },
  'receptionist@kilifasuites.com': {
    id: 'usr-recept-001',
    email: 'receptionist@kilifasuites.com',
    name: 'Front Desk Reception',
    role: Role.RECEPTIONIST,
    pass: 'KilifaPass2026!',
  },
  'staff@kilifasuites.com': {
    id: 'usr-staff-001',
    email: 'staff@kilifasuites.com',
    name: 'Hospitality Staff',
    role: Role.STAFF,
    pass: 'KilifaPass2026!',
  },
  'musa.njie@example.com': {
    id: 'usr-guest-001',
    email: 'musa.njie@example.com',
    name: 'Musa Njie',
    role: Role.GUEST,
    pass: 'KilifaPass2026!',
  },
};

class AuthService {
  /**
   * Authenticate user with email and password
   */
  public async login(identifier: string, password: string): Promise<LoginResponse> {
    const raw = identifier.toLowerCase().trim();

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
      if (!isMemoryFallbackAllowed()) {
        console.error('[AUTH SERVICE] Primary database unavailable and memory fallback is disabled:', (err as Error).message);
        throw new ApiError(503, 'Database service is temporarily unavailable. Please try again shortly.');
      }
      console.warn('[AUTH SERVICE] Database check failed, falling back to in-memory account directory:', (err as Error).message);
    }

    if (!isMemoryFallbackAllowed()) {
      throw new ApiError(401, 'Invalid credentials. Account not found.');
    }

    // Flexible fallback account search by email, username prefix, full name, or role name
    const fallbackUser = Object.values(FALLBACK_USERS).find((acc) => {
      const emailMatch = acc.email.toLowerCase() === raw;
      const usernameMatch = acc.email.split('@')[0].toLowerCase() === raw;
      const nameMatch = acc.name.toLowerCase().includes(raw) || raw.includes(acc.name.toLowerCase());
      const roleMatch = acc.role.toLowerCase() === raw;
      return emailMatch || usernameMatch || nameMatch || roleMatch;
    });

    if (fallbackUser) {
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
   * Retrieve current user profile by User ID
   */
  public async getProfile(userId: string): Promise<UserDTO> {
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
      if (!isMemoryFallbackAllowed()) {
        throw new ApiError(503, 'Database service is temporarily unavailable. Please try again shortly.');
      }
      console.warn('[AUTH SERVICE] Database query for profile failed, searching fallback users:', (err as Error).message);
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
