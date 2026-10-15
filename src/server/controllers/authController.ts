import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { AuthRequest } from '../middleware/authMiddleware';
import { ApiError } from '../middleware/errorHandler';
import { Role } from '@prisma/client';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const identifier = req.body.email || req.body.username || req.body.identifier;
    const password = req.body.password;

    const errors: string[] = [];
    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      errors.push('email or account identifier is required');
    }
    if (!password || typeof password !== 'string' || !password.trim()) {
      errors.push('password is required');
    }

    if (errors.length > 0) {
      throw new ApiError(400, 'Validation Failed', errors);
    }

    const result = await authService.login(identifier, password);

    res.status(200).json({
      status: 'success',
      message: 'Authentication successful. Token issued.',
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const profile = await authService.getProfile(req.user.id);

    res.status(200).json({
      status: 'success',
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Account Registration Controller
 * Protected: Requires verified administrative credentials (ADMIN or OWNER)
 */
export const register = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required before creating accounts.');
    }

    if (req.user.role !== Role.ADMIN && req.user.role !== Role.OWNER) {
      throw new ApiError(403, 'Forbidden. Only administrators or owners may register staff accounts.');
    }

    const { name, email, username, password, role } = req.body;
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    // Role assignment security: callers cannot assign unverified roles or escalate to OWNER unless they are OWNER
    let targetRole: Role = Role.STAFF;
    if (role && Object.values(Role).includes(role)) {
      if (role === Role.OWNER && req.user.role !== Role.OWNER) {
        throw new ApiError(403, 'Only property owners can register additional owner accounts.');
      }
      targetRole = role;
    }

    const createdUser = await authService.register({
      name: name || 'Staff Member',
      email,
      username,
      password,
      role: targetRole,
    });

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully.',
      user: createdUser,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Password Reset Initiation Controller
 * Accepts email, returns generic message to prevent enumeration, dispatches token if user exists
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.trim()) {
      throw new ApiError(400, 'A valid email address is required');
    }

    const result = await authService.requestPasswordReset(email);

    res.status(200).json({
      status: 'success',
      message: result.message,
      ...(result.debugToken && { debugToken: result.debugToken }),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Password Reset Execution Controller
 * Accepts verified single-use token and new password
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || typeof token !== 'string' || !token.trim()) {
      throw new ApiError(400, 'Password reset token is required');
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 8) {
      throw new ApiError(400, 'New password must be at least 8 characters long');
    }

    const result = await authService.executePasswordReset(token, newPassword);

    res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully. Please clear the client authorization header.',
  });
};
