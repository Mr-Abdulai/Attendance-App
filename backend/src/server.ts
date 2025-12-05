import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import rateLimit from 'express-rate-limit';
import env from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { initializeSocket } from './socket/socketHandler';

// Routes
import authRoutes from './routes/auth';
import sessionRoutes from './routes/sessions';
import attendanceRoutes from './routes/attendance';

const app = express();
const server = createServer(app);

// Initialize Socket.io
export const io = initializeSocket(server);

// Middleware
app.use(cors({
  origin: env.CORS_ORIGIN.split(','),
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/attendance', attendanceRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${env.NODE_ENV}`);
});

export default app;

