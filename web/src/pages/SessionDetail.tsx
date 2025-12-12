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

  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,

  Snackbar,
  AlertColor,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { sessionService, Session, Attendance } from '../services/sessionService';
import { useSocket } from '../hooks/useSocket';
import { QRCodeSVG } from 'qrcode.react';
import SessionTimer from '../components/SessionTimer';

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Manual Attendance State
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [manualStudentId, setManualStudentId] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>('success');

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
      ['Student Name', 'Email', 'Scanned At', 'Distance (m)', 'Status', 'Type'].join(','),
      ...session.attendance.map((att) =>
        [
          att.student.name,
          att.student.email,
          format(new Date(att.scannedAt), 'PPp'),
          att.distance.toFixed(2),
          att.status,
          att.type || 'QR',
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

  const handleManualSubmit = async () => {
    if (!id || !manualStudentId.trim()) return;

    setManualLoading(true);
    try {
      await sessionService.markManualAttendance(id, manualStudentId.trim());
      setManualDialogOpen(false);
      setManualStudentId('');
      loadSession(); // Reload to show new student
      setSnackbarMessage('Student added successfully');
      setSnackbarSeverity('success');
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.error || 'Failed to add student');
      setSnackbarSeverity('error');
    } finally {
      setManualLoading(false);
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
      case 'DUPLICATE':
        return 'error';
      case 'EXPIRED':
        return 'default';
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
            <>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => setManualDialogOpen(true)}
                sx={{ mr: 2 }}
              >
                Manual Entry
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleEndSession}
                sx={{ mr: 2 }}
              >
                End Session
              </Button>
            </>
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
            {session.status === 'ACTIVE' && (
              <SessionTimer
                startTime={session.startTime}
                duration={session.duration}
                onExpire={() => {
                  setSnackbarMessage('Session time has expired');
                  setSnackbarSeverity('info');
                  loadSession(); // Reload to update status and hide buttons
                }}
              />
            )}
          </Box>
          <Chip
            label={session.status === 'EXPIRED' ? 'ENDED' : session.status}
            color={getStatusColor(session.status) as any}
            size="medium"
          />
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Attendance Records ({session.attendance?.length || 0})
        </Typography>
      </Paper>

      {session.status === 'ACTIVE' && (
        <Paper sx={{ p: 3, mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Session QR Code
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #eee' }}>
            <QRCodeSVG value={session.qrCode} size={256} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Students can scan this code to mark attendance
          </Typography>
        </Paper>
      )}

      {session.attendance && session.attendance.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {session.attendance.map((att) => (
                <TableRow key={att.id}>
                  <TableCell>{att.student.name}</TableCell>
                  <TableCell>{att.student.email}</TableCell>
                  <TableCell>{format(new Date(att.scannedAt), 'PPp')}</TableCell>
                  <TableCell>
                    {att.type === 'MANUAL' ? (
                      <Chip label="Manual" size="small" color="primary" variant="outlined" />
                    ) : (
                      <Chip label="QR Scan" size="small" variant="outlined" />
                    )}
                  </TableCell>
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

      <Dialog open={manualDialogOpen} onClose={() => setManualDialogOpen(false)}>
        <DialogTitle>Manually Add Student</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
            Enter the student's unique ID (e.g. <b>s12345</b>) to mark them as present.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Student ID"
            placeholder="s..."
            type="text"
            fullWidth
            variant="outlined"
            value={manualStudentId}
            onChange={(e) => setManualStudentId(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setManualDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleManualSubmit} disabled={manualLoading} variant="contained">
            {manualLoading ? 'Adding...' : 'Add Student'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snackbarMessage} autoHideDuration={6000} onClose={() => setSnackbarMessage('')}>
        <Alert onClose={() => setSnackbarMessage('')} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
