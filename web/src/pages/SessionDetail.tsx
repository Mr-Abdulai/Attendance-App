import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { sessionService, Session, Attendance } from '../services/sessionService';
import { useSocket } from '../hooks/useSocket';

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSession = async () => {
    if (!id) return;

    try {
      const data = await sessionService.getSession(id);
      setSession(data.session);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, [id]);

  // Real-time updates via socket
  useSocket(
    id || null,
    (attendanceData) => {
      if (session) {
        loadSession(); // Reload session to get updated attendance
      }
    }
  );

  const handleExport = () => {
    if (!session || !session.attendance) return;

    const csvContent = [
      ['Student Name', 'Email', 'Scanned At', 'Distance (m)', 'Status'].join(','),
      ...session.attendance.map((att) =>
        [
          att.student.name,
          att.student.email,
          format(new Date(att.scannedAt), 'PPp'),
          att.distance.toFixed(2),
          att.status,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${session.name}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleEndSession = async () => {
    if (!id) return;

    try {
      await sessionService.endSession(id);
      loadSession();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to end session');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading session details...</Typography>
      </Container>
    );
  }

  if (error && !session) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  if (!session) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VALID':
        return 'success';
      case 'OUT_OF_RANGE':
        return 'warning';
      case 'INVALID':
      case 'EXPIRED':
      case 'DUPLICATE':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
        <Box>
          {session.status === 'ACTIVE' && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleEndSession}
              sx={{ mr: 2 }}
            >
              End Session
            </Button>
          )}
          {session.attendance && session.attendance.length > 0 && (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
            >
              Export CSV
            </Button>
          )}
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              {session.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Created: {format(new Date(session.createdAt), 'PPp')}
            </Typography>
            {session.endTime && (
              <Typography variant="body2" color="text.secondary">
                Ended: {format(new Date(session.endTime), 'PPp')}
              </Typography>
            )}
          </Box>
          <Chip
            label={session.status}
            color={getStatusColor(session.status) as any}
            size="medium"
          />
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Attendance Records ({session.attendance?.length || 0})
        </Typography>
      </Paper>

      {session.attendance && session.attendance.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Scanned At</TableCell>
                <TableCell>Distance (m)</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {session.attendance.map((att) => (
                <TableRow key={att.id}>
                  <TableCell>{att.student.name}</TableCell>
                  <TableCell>{att.student.email}</TableCell>
                  <TableCell>{format(new Date(att.scannedAt), 'PPp')}</TableCell>
                  <TableCell>{att.distance.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={att.status}
                      color={getStatusColor(att.status) as any}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No attendance records yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Students can scan the QR code to mark their attendance
          </Typography>
        </Paper>
      )}
    </Container>
  );
}

