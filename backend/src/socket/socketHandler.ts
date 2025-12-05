import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import prisma from '../config/database';

export function initializeSocket(server: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(server, {
    cors: {
      origin: env.CORS_ORIGIN.split(','),
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET) as {
        userId: string;
        email: string;
        role: string;
      };

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.user.email}`);

    // Join lecturer room to receive attendance updates
    if (socket.data.user.role === 'LECTURER') {
      socket.on('join-session', async (sessionId: string) => {
        socket.join(`session:${sessionId}`);
        console.log(`Lecturer ${socket.data.user.email} joined session ${sessionId}`);
      });

      socket.on('leave-session', (sessionId: string) => {
        socket.leave(`session:${sessionId}`);
        console.log(`Lecturer ${socket.data.user.email} left session ${sessionId}`);
      });
    }

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.user.email}`);
    });
  });

  return io;
}

/**
 * Emit attendance update to lecturer
 */
export function emitAttendanceUpdate(io: SocketIOServer, sessionId: string, attendance: any): void {
  io.to(`session:${sessionId}`).emit('attendance-update', attendance);
}

