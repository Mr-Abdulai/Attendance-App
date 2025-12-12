import { Router } from 'express';
import {
  createSession,
  endSession,
  getLecturerSessions,
  getSession,
  createSessionSchema,
  endSessionSchema,
  deleteSession,
} from '../controllers/sessionController';
import { markManualAttendance } from '../controllers/attendanceController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Create session (lecturer only)
router.post('/', requireRole('LECTURER'), validate(createSessionSchema), catchAsync(createSession));

// End session (lecturer only)
router.post('/:id/end', requireRole('LECTURER'), validate(endSessionSchema), catchAsync(endSession));

// Get lecturer's sessions
router.get('/lecturer', requireRole('LECTURER'), catchAsync(getLecturerSessions));

// Get specific session
router.get('/:id', catchAsync(getSession));

// Delete session (lecturer only)
router.delete('/:id', requireRole('LECTURER'), validate(endSessionSchema), catchAsync(deleteSession));

// Manual attendance (lecturer only)
router.post('/:sessionId/attendance/manual', requireRole('LECTURER'), catchAsync(markManualAttendance));

export default router;

