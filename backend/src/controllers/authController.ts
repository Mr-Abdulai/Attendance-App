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

  // Generate Unique Student ID (S + 5 random digits)
  // Collision probability is manageable for MVP, but retry logic is safer.
  // For simplicity, we'll try once. Ideally this should be a loop.
  const generateStudentId = () => {
    const random = Math.floor(10000 + Math.random() * 90000); // 10000 to 99999
    return `S${random}`;
  };

  let studentId = null;
  if (!role || role === 'STUDENT') {
    studentId = generateStudentId();
    // Simple check (in production, use a loop to ensure uniqueness)
    const existingId = await prisma.user.findUnique({ where: { studentId } });
    if (existingId) {
      studentId = generateStudentId(); // Retry once
    }
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
      studentId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      studentId: true,
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
      studentId: user.studentId,
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
      studentId: true,
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
  }
}

// Update Profile Schema
export const updateProfileSchema = z.object({
  body: z.object({
    studentId: z.string()
      .min(5, 'Student ID must be at least 5 characters')
      .refine(val => /^[a-z]/.test(val), 'Student ID must start with a lowercase letter'),
  }),
});

/**
 * Update current user profile
 */
export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new AppError(401, 'Authentication required');
  }

  const { studentId } = req.body;

  // Check if studentId is already taken by another user
  if (studentId) {
    const existing = await prisma.user.findUnique({
      where: { studentId },
    });

    if (existing && existing.id !== req.user.id) {
      throw new AppError(409, 'Student ID is already taken');
    }
  }

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { studentId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      studentId: true,
      createdAt: true,
    },
  });

  res.json({ user, message: 'Profile updated successfully' });
}

