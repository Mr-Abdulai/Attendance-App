import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  refreshToken,
  registerSchema,
  loginSchema,
  updateProfile,
  updateProfileSchema
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

router.post('/register', validate(registerSchema), catchAsync(register));
router.post('/login', validate(loginSchema), catchAsync(login));
router.post('/refresh', catchAsync(refreshToken));
router.get('/profile', authenticateToken, catchAsync(getProfile));
router.put('/profile', authenticateToken, validate(updateProfileSchema), catchAsync(updateProfile));

export default router;

