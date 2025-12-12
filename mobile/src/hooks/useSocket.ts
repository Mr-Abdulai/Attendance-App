import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { authService } from '../services/authService';
import { API_BASE_URL } from '../services/api';

let socket: Socket | null = null;

export const useSocket = (roomId: string | null = null, onMessage?: (data: any) => void) => {
    useEffect(() => {
        // Initialize socket if not already done
        if (!socket) {
            authService.getToken().then(token => {
                if (!token) return;

                socket = io(API_BASE_URL.replace('/api', ''), {
                    auth: { token },
                    transports: ['websocket'],
                });

                // Join room if provided
                if (socket && roomId) {
                    socket.emit('join-room', roomId);
                }

                // Listen for events if handler provided
                if (socket && onMessage) {
                    socket.on('attendance-update', onMessage);
                }
            });
        } else {
            // If socket already exists, ensure we join the new room and listen
            if (roomId) {
                socket.emit('join-room', roomId);
            }
            if (onMessage) {
                socket.off('attendance-update'); // Remove old listener to avoid duplicates
                socket.on('attendance-update', onMessage);
            }
        }

        return () => {
            if (socket) {
                if (roomId) {
                    socket.emit('leave-room', roomId);
                }
                if (onMessage) {
                    socket.off('attendance-update', onMessage);
                }
            }
        };
    }, [roomId, onMessage]);

    return socket;
};
