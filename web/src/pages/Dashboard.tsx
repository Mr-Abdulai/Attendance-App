import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { sessionService, Session } from '../services/sessionService';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = async () => {
    try {
      const data = await sessionService.getLecturerSessions();
      setSessions(data.sessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'ENDED':
        return 'default';
      case 'EXPIRED':
        return 'error';
      default:
        return 'default';
    }
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const handleDeleteClick = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (sessionToDelete) {
      try {
        await sessionService.deleteSession(sessionToDelete);
        setSessions(sessions.filter(s => s.id !== sessionToDelete));
        setDeleteDialogOpen(false);
        setSessionToDelete(null);
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* ... existing header code ... */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1">
            Welcome, {user?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your attendance sessions
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/sessions/create')}
            sx={{ mr: 2 }}
          >
            Create Session
          </Button>
          <Button variant="outlined" onClick={logout}>
            Logout
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Your Sessions</Typography>
        <IconButton onClick={loadSessions} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {loading ? (
        <Typography>Loading sessions...</Typography>
      ) : sessions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No sessions yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first attendance session to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/sessions/create')}
          >
            Create Session
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {sessions.map((session) => (
            <Grid item xs={12} md={6} lg={4} key={session.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">{session.name}</Typography>
                    <Chip
                      label={session.status}
                      color={getStatusColor(session.status) as any}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Created: {format(new Date(session.createdAt), 'PPp')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Students: {session._count?.attendance || 0}
                  </Typography>
                  {session.endTime && (
                    <Typography variant="body2" color="text.secondary">
                      Ended: {format(new Date(session.endTime), 'PPp')}
                    </Typography>
                  )}
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      onClick={() => navigate(`/sessions/${session.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteClick(session.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Session</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this session? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

