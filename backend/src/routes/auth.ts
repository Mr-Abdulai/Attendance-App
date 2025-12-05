import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  refreshToken,
  registerSchema,
  loginSchema,
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.get('/profile', authenticateToken, getProfile);

export default router;

