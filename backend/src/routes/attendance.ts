import { Router } from 'express';
import {
  markAttendance,
  getStudentAttendance,
  markAttendanceSchema,
  getStudentAttendanceSchema,
} from '../controllers/attendanceController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Mark attendance (student only)
router.post('/mark', requireRole('STUDENT'), validate(markAttendanceSchema), markAttendance);

// Get student attendance history
router.get('/history', requireRole('STUDENT'), validate(getStudentAttendanceSchema), getStudentAttendance);

export default router;

