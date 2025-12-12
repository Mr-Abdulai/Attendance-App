import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { sessionService } from '../services/sessionService';
import { useSocket } from '../hooks/useSocket';

interface QRCodeDisplayProps {
  session: {
    id: string;
    name: string;
    qrCode: string;
    qrCodeImage?: string;
    startTime: string;
    duration: number;
    status: string;
  };
  onEndSession: () => void;
}

export default function QRCodeDisplay({ session, onEndSession }: QRCodeDisplayProps) {
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState(session.duration);
  const [isEnded, setIsEnded] = useState(false);
  const [attendanceCount, setAttendanceCount] = useState(0);

  // Calculate end time
  const endTime = new Date(new Date(session.startTime).getTime() + session.duration * 1000);

  // Timer countdown
  useEffect(() => {
    if (isEnded || session.status !== 'ACTIVE') return;

    const interval = setInterval(() => {
      const now = new Date();
      const remaining = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        setIsEnded(true);
        handleAutoEnd();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session.status, isEnded]);

  // Real-time attendance updates
  useSocket(
    session.id,
    (data) => {
      setAttendanceCount((prev) => prev + 1);
    }
  );

  // Load initial attendance count
  useEffect(() => {
    const loadSession = async () => {
      try {
        const data = await sessionService.getSession(session.id);
        setAttendanceCount(data.session._count?.attendance || 0);
      } catch (error) {
        console.error('Failed to load session:', error);
      }
    };
    loadSession();
  }, [session.id]);

  const handleAutoEnd = async () => {
    try {
      await sessionService.endSession(session.id);
      setIsEnded(true);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const handleManualEnd = async () => {
    try {
      await sessionService.endSession(session.id);
      setIsEnded(true);
      onEndSession();
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isEnded || session.status !== 'ACTIVE') {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          This session has ended
        </Alert>
        <Typography variant="h6" gutterBottom>
          Session: {session.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Total attendance: {attendanceCount} students
        </Typography>
        <Button variant="contained" onClick={onEndSession}>
          Back to Dashboard
        </Button>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        {session.name}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <Box
          sx={{
            p: 3,
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: 2,
            display: 'inline-block',
          }}
        >
          <QRCodeSVG
            value={session.qrCode}
            size={300}
            level="H"
            includeMargin={true}
          />
        </Box>
      </Box>

      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Time Remaining: {formatTime(timeRemaining)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Students scanned: {attendanceCount}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          color="error"
          onClick={handleManualEnd}
          size="large"
        >
          End Session Now
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate(`/sessions/${session.id}`)}
        >
          View Details
        </Button>
      </Box>

      <Alert severity="info" sx={{ mt: 3 }}>
        Display this QR code on the board. Students can scan it to mark their attendance.
        The session will automatically end in {formatTime(timeRemaining)}.
      </Alert>
    </Paper>
  );
}

