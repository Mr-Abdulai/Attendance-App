import { Router } from 'express';
import {
    createCourse,
    getCourses,
    deleteCourse,
    createCourseSchema,
} from '../controllers/courseController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

// All routes require authentication
router.use(authenticateToken);
router.use(requireRole('LECTURER', 'ADMIN')); // Courses are for lecturers/admins

router.post('/', validate(createCourseSchema), catchAsync(createCourse));
router.get('/', catchAsync(getCourses));
router.delete('/:id', catchAsync(deleteCourse));

export default router;
