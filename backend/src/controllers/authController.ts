import { Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/database';
import env from '../config/env';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const saltRounds = 10;

// Validation schemas
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    role: z.enum(['STUDENT', 'LECTURER']).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

/**
 * Generate JWT tokens
 */
function generateTokens(userId: string, email: string, role: string) {
  const accessToken = jwt.sign(
    { userId, email, role },
    env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, email, role },
    env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

/**
 * Register a new user
 */
export async function register(req: AuthRequest, res: Response): Promise<void> {
  const { email, password, name, role } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError(400, 'User with this email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: role || 'STUDENT',
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);

  res.status(201).json({
    message: 'User registered successfully',
    user,
    accessToken,
    refreshToken,
  });
}

/**
 * Login user
 */
export async function login(req: AuthRequest, res: Response): Promise<void> {
  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new AppError(401, 'Invalid email or password');
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    accessToken,
    refreshToken,
  });
}

/**
 * Get current user profile
 */
export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new AppError(401, 'Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  res.json({ user });
}

/**
 * Refresh access token
 */
export async function refreshToken(req: AuthRequest, res: Response): Promise<void> {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError(400, 'Refresh token required');
  }

  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      throw new AppError(401, 'User not found');
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken });
  } catch (error) {
    throw new AppError(403, 'Invalid or expired refresh token');
  }
}

