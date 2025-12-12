import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

// Schemas
export const createCourseSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        code: z.string().min(2, 'Code must be at least 2 characters'),
        description: z.string().optional(),
    }),
});

/**
 * Create a new course
 */
export async function createCourse(req: AuthRequest, res: Response): Promise<void> {
    const { name, code, description } = req.body;
    const lecturerId = req.user?.id;

    if (!lecturerId) {
        throw new AppError(401, 'User not authenticated'); // Should be caught by auth middleware
    }

    // Check uniqueness for this lecturer
    const existing = await prisma.course.findUnique({
        where: {
            lecturerId_code: { lecturerId, code },
        },
    });

    if (existing) {
        throw new AppError(400, 'Course with this code already exists');
    }

    const course = await prisma.course.create({
        data: {
            name,
            code,
            description,
            lecturerId,
        },
    });

    res.status(201).json({
        message: 'Course created successfully',
        course,
    });
}

/**
 * Get all courses for the logged-in lecturer
 */
export async function getCourses(req: AuthRequest, res: Response): Promise<void> {
    const lecturerId = req.user?.id;

    const courses = await prisma.course.findMany({
        where: { lecturerId },
        orderBy: { updatedAt: 'desc' },
        include: {
            _count: {
                select: { sessions: true },
            },
        },
    });

    res.json({ courses });
}

/**
 * Delete a course
 */
export async function deleteCourse(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const lecturerId = req.user?.id;

    // Verify ownership
    const course = await prisma.course.findUnique({
        where: { id },
    });

    if (!course) {
        throw new AppError(404, 'Course not found');
    }

    if (course.lecturerId !== lecturerId) {
        throw new AppError(403, 'Not authorized to delete this course');
    }

    await prisma.course.delete({
        where: { id },
    });

    res.json({ message: 'Course deleted successfully' });
}
