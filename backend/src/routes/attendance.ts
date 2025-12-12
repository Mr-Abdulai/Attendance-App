import { Router } from 'express';
import {
  markAttendance,
  getStudentAttendance,
  markManualAttendance,
  markAttendanceSchema,
  getStudentAttendanceSchema,
} from '../controllers/attendanceController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Mark attendance (student only)
router.post('/mark', requireRole('STUDENT'), validate(markAttendanceSchema), catchAsync(markAttendance));

// Get student attendance history
router.get('/history', requireRole('STUDENT'), validate(getStudentAttendanceSchema), catchAsync(getStudentAttendance));

// Manual Attendance (Lecturer only)
router.post(
  '/sessions/:sessionId/attendance/manual',
  requireRole('LECTURER', 'ADMIN'),
  catchAsync(markManualAttendance)
);

export default router;
