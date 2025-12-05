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
import { authenticateToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Create session (lecturer only)
router.post('/', requireRole('LECTURER'), validate(createSessionSchema), createSession);

// End session (lecturer only)
router.post('/:id/end', requireRole('LECTURER'), validate(endSessionSchema), endSession);

// Get lecturer's sessions
router.get('/lecturer', requireRole('LECTURER'), getLecturerSessions);

// Get specific session
router.get('/:id', getSession);

// Delete session (lecturer only)
router.delete('/:id', requireRole('LECTURER'), validate(endSessionSchema), deleteSession);

export default router;

