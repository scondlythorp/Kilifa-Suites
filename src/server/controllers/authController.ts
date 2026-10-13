import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { AuthRequest } from '../middleware/authMiddleware';
import { ApiError } from '../middleware/errorHandler';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const identifier = req.body.email || req.body.username || req.body.identifier;
    const password = req.body.password;

    const errors: string[] = [];
    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      errors.push('email, username, or account name is required');
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
 * Account Registration
 * Protected: Requires authenticated System Administrator
 */
export const register = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email, username, password, role } = req.body;
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const newUser = await authService.register({
      name: name || 'Staff Member',
      email,
      username,
      password,
      role,
    });

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully by Administrator.',
      data: newUser,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Request Password Reset Token
 * Enforces rate limiting, token generation, and constant-time privacy preserving response
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new ApiError(400, 'Email address is required');
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
 * Execute Password Reset with Single-Use Token
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      throw new ApiError(400, 'Reset token and new password are required');
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
    message: 'Logged out successfully. Please clear client authorization headers.',
  });
};
