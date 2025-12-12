import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

// Auto-detect production protocol
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.replace('/api', '');
const SOCKET_URL = BASE_URL.replace(/^http/, 'ws'); // http -> ws, https -> wss

export function useSocket(sessionId: string | null, onAttendanceUpdate: (data: any) => void) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user || !sessionId) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    // Connect to socket
    const socket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });

    socketRef.current = socket;

    socket.on('connect', () => {

      socket.emit('join-session', sessionId);
    });

    socket.on('attendance-update', (data) => {
      onAttendanceUpdate(data);
    });

    socket.on('disconnect', () => {

    });

    return () => {
      socket.emit('leave-session', sessionId);
      socket.disconnect();
    };
  }, [user, sessionId, onAttendanceUpdate]);

  return socketRef.current;
}

