import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import rateLimit from 'express-rate-limit';
import env from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { initializeSocket } from './socket/socketHandler';

// Routes
import authRoutes from './routes/auth';
import sessionRoutes from './routes/sessions';
import attendanceRoutes from './routes/attendance';
import courseRoutes from './routes/courses';

const app = express();
const server = createServer(app);

// Trust proxy (required for Rate Limiting behind load balancers like Render/Railway)
app.set('trust proxy', 1);

// Initialize Socket.io
export const io = initializeSocket(server);

// Middleware
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Strict limit for auth (20 requests per 15 mins)
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // General limit (100 flows per 15 mins)
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply strict limit to auth routes
app.use('/api/auth', authLimiter);
// Apply general limit to all API routes
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/courses', courseRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = env.PORT || 5000;

import logger from './config/logger';

server.listen(Number(PORT), '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
});

export default app;

