import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { generateQRToken, generateQRCodeImage } from '../services/qrService';

// Validation schemas
export const createSessionSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Session name is required'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    courseId: z.string().optional(),
  }),
});

export const endSessionSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

/**
 * Create a new attendance session
 */
export async function createSession(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'LECTURER') {
    throw new AppError(403, 'Only lecturers can create sessions');
  }

  const { name, latitude, longitude, courseId } = req.body;

  // Create session
  const session = await prisma.session.create({
    data: {
      lecturerId: req.user.id,
      courseId: courseId || null,
      name,
      latitude,
      longitude,
      qrCode: '', // Will be updated after creation
      duration: 300, // 5 minutes
      status: 'ACTIVE',
    },
  });

  // Generate QR code token
  const qrToken = generateQRToken(session.id);
  const qrCodeImage = await generateQRCodeImage(qrToken);

  // Update session with QR code
  const updatedSession = await prisma.session.update({
    where: { id: session.id },
    data: { qrCode: qrToken },
    include: {
      lecturer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      course: true,
    },
  });

  // Set auto-end timer (5 minutes)
  setTimeout(async () => {
    try {
      const currentSession = await prisma.session.findUnique({
        where: { id: session.id },
      });

      if (currentSession && currentSession.status === 'ACTIVE') {
        await prisma.session.update({
          where: { id: session.id },
          data: {
            status: 'EXPIRED',
            endTime: new Date(),
          },
        });
      }
    } catch (error) {
      console.error('Error auto-ending session:', error);
    }
  }, 300000); // 5 minutes

  res.status(201).json({
    message: 'Session created successfully',
    session: {
      ...updatedSession,
      qrCodeImage,
    },
  });
}

/**
 * End a session manually
 */
export async function endSession(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'LECTURER') {
    throw new AppError(403, 'Only lecturers can end sessions');
  }

  const { id } = req.params;

  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      lecturer: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!session) {
    throw new AppError(404, 'Session not found');
  }

  if (session.lecturerId !== req.user.id) {
    throw new AppError(403, 'You can only end your own sessions');
  }

  if (session.status !== 'ACTIVE') {
    throw new AppError(400, 'Session is already ended or expired');
  }

  const updatedSession = await prisma.session.update({
    where: { id },
    data: {
      status: 'ENDED',
      endTime: new Date(),
    },
  });

  res.json({
    message: 'Session ended successfully',
    session: updatedSession,
  });
}

/**
 * Get all sessions for a lecturer
 */
export async function getLecturerSessions(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'LECTURER') {
    throw new AppError(403, 'Only lecturers can view their sessions');
  }

  const sessions = await prisma.session.findMany({
    where: {
      lecturerId: req.user.id,
      deletedAt: null,
    },
    include: {
      attendance: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          scannedAt: 'desc',
        },
      },
      _count: {
        select: {
          attendance: true,
        },
      },
      course: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.json({ sessions });
}

/**
 * Get a specific session with attendance
 */
export async function getSession(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      lecturer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      attendance: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          scannedAt: 'desc',
        },
      },
      _count: {
        select: {
          attendance: true,
        },
      },
    },
  });

  if (!session) {
    throw new AppError(404, 'Session not found');
  }

  // Check if user has permission to view this session
  if (req.user?.role === 'LECTURER' && session.lecturerId !== req.user.id) {
    throw new AppError(403, 'You can only view your own sessions');
  }

  res.json({ session });
}

/**
 * Delete a session
 */
export async function deleteSession(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'LECTURER') {
    throw new AppError(403, 'Only lecturers can delete sessions');
  }

  const { id } = req.params;

  const session = await prisma.session.findUnique({
    where: { id },
  });

  if (!session) {
    throw new AppError(404, 'Session not found');
  }

  if (session.lecturerId !== req.user.id) {
    throw new AppError(403, 'You can only delete your own sessions');
  }

  await prisma.session.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  res.json({ message: 'Session deleted successfully' });
}

