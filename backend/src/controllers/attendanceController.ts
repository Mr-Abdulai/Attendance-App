import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { validateQRToken } from '../services/qrService';
import { verifyLocation } from '../services/locationService';
import { io } from '../server';

// Validation schemas
export const markAttendanceSchema = z.object({
  body: z.object({
    qrCode: z.string().min(1, 'QR code is required'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
});

export const getStudentAttendanceSchema = z.object({
  query: z.object({
    limit: z.string().optional(),
    offset: z.string().optional(),
  }),
});

/**
 * Mark attendance for a student
 */
export async function markAttendance(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'STUDENT') {
    throw new AppError(403, 'Only students can mark attendance');
  }

  const { qrCode, latitude, longitude } = req.body;

  // Validate QR code token
  const qrData = validateQRToken(qrCode);
  if (!qrData) {
    throw new AppError(400, 'Invalid or expired QR code');
  }

  const { sessionId } = qrData;

  // Find session
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new AppError(404, 'Session not found');
  }

  if (session.status !== 'ACTIVE') {
    throw new AppError(400, 'Session is not active');
  }

  // Check if session has expired
  const sessionEndTime = new Date(session.startTime.getTime() + session.duration * 1000);
  if (new Date() > sessionEndTime) {
    await prisma.session.update({
      where: { id: sessionId },
      data: { status: 'EXPIRED', endTime: sessionEndTime },
    });
    throw new AppError(400, 'Session has expired');
  }

  // Check if student already marked attendance
  const existingAttendance = await prisma.attendance.findUnique({
    where: {
      sessionId_studentId: {
        sessionId,
        studentId: req.user.id,
      },
    },
  });

  if (existingAttendance) {
    throw new AppError(409, 'You have already marked attendance for this session');
  }

  // Verify location
  // NOTE: Using 20000 meters (20km) for development (laptops have poor GPS accuracy)
  // In production with real GPS devices, change this to 10 meters
  const maxDistance = process.env.NODE_ENV === 'development' ? 20000 : 10;



  const locationCheck = verifyLocation(
    { latitude, longitude },
    { latitude: session.latitude, longitude: session.longitude },
    maxDistance
  );



  // Check location BEFORE creating attendance record
  if (!locationCheck.isValid) {
    throw new AppError(400, `You are too far from the lecture location. You are ${locationCheck.distance.toFixed(2)} meters away. Maximum allowed distance is ${maxDistance} meters.`);
  }

  // Create attendance record (only if location is valid)
  const attendance = await prisma.attendance.create({
    data: {
      sessionId,
      studentId: req.user.id,
      latitude,
      longitude,
      distance: locationCheck.distance,
      status: 'VALID',
    },
    include: {
      session: {
        select: {
          id: true,
          name: true,
          startTime: true,
        },
      },
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Emit socket event to lecturer
  io.to(`session:${sessionId}`).emit('attendance-update', {
    attendance: {
      ...attendance,
      student: attendance.student,
    },
  });

  res.status(201).json({
    message: 'Attendance marked successfully',
    attendance,
  });
}

/**
 * Get attendance history for a student
 */
export async function getStudentAttendance(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'STUDENT') {
    throw new AppError(403, 'Only students can view their attendance');
  }

  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;

  const attendance = await prisma.attendance.findMany({
    where: {
      studentId: req.user.id,
    },
    include: {
      session: {
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
      },
    },
    orderBy: {
      scannedAt: 'desc',
    },
    take: limit,
    skip: offset,
  });

  const total = await prisma.attendance.count({
    where: {
      studentId: req.user.id,
    },
  });

  res.json({
    attendance,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  });
}

// ... existing imports ...

/**
 * Manually mark attendance for a student (Lecturer only)
 */
export async function markManualAttendance(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { sessionId } = req.params;
  const { studentId } = req.body; // This is the Unique ID (e.g. S12345), NOT the database UUID

  if (!studentId) {
    throw new AppError(400, 'Student ID is required');
  }

  // 1. Find the student by their User.studentId
  const student = await prisma.user.findUnique({
    where: { studentId },
  });

  if (!student) {
    throw new AppError(404, 'Student ID not found');
  }

  // 2. Check if session exists
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new AppError(404, 'Session not found');
  }

  // 3. Mark attendance
  // We use upsert to avoid duplicate errors if they try again, or just create.
  // Requirement: "Student is manually added... specific tag"
  try {
    const attendance = await prisma.attendance.create({
      data: {
        sessionId,
        studentId: student.id, // Database UUID
        latitude: 0, // Manual entry has no location
        longitude: 0,
        distance: 0,
        status: 'VALID',
        type: 'MANUAL',
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
          }
        }
      }
    });

    // Emit socket event to student
    // We emit to specific user channel so they get the update
    io.to(`user:${student.id}`).emit('attendance-update', {
      attendance: {
        ...attendance,
        student: attendance.student,
      },
    });

    res.status(201).json({
      message: 'Student manually added successfully',
      attendance
    });
  } catch (error: any) {
    // Handle unique constraint violation (P2002)
    if (error.code === 'P2002') {
      throw new AppError(409, 'Student is already marked present for this session');
    }
    throw error;
  }
}
