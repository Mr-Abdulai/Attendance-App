import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { sessionService, Session } from '../services/sessionService';
import SessionTable from '../components/dashboard/SessionTable';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const loadSessions = async () => {
    setLoading(true);
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

  const handleDuplicate = (session: Session) => {
    navigate(`/sessions/create?duplicate=${session.id}`);
  };

  const handleDeleteClick = (id: string) => {
    setSessionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (sessionToDelete) {
      try {
        await sessionService.deleteSession(sessionToDelete);
        setSessions(prev => prev.filter(s => s.id !== sessionToDelete));
        setDeleteDialogOpen(false);
        setSessionToDelete(null);
      } catch (error) {
        console.error('Failed to delete', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4, p: 3, borderRadius: 4, bgcolor: 'primary.main', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome back, {user?.name}! 👋
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Here's what's happening with your sessions today.
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button variant="contained" sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }} startIcon={<AddIcon />} onClick={() => navigate('/sessions/create')}>
              Create New Session
            </Button>
            <Button variant="outlined" sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'grey.200', bgcolor: 'rgba(255,255,255,0.1)' } }} onClick={() => navigate('/analytics')}>
              View Analytics
            </Button>
          </Box>
        </Box>
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Box sx={{ position: 'absolute', bottom: -30, right: 80, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
      </Box>

      {/* Quick Stats Row (Simplified) */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="body2" color="text.secondary">Total Sessions</Typography>
          <Typography variant="h4" fontWeight="bold">{sessions.length}</Typography>
        </Paper>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="body2" color="text.secondary">Active Now</Typography>
          <Typography variant="h4" fontWeight="bold" color="success.main">
            {sessions.filter(s => s.isActive).length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="body2" color="text.secondary">Avg. Attendance</Typography>
          <Typography variant="h4" fontWeight="bold">
            {sessions.length > 0 ? Math.round(sessions.reduce((acc, curr) => acc + (curr._count?.attendance || 0), 0) / sessions.length) : 0}
          </Typography>
        </Paper>
      </Box>

      {/* Recent Sessions Table (Limit 5) */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">Recent Sessions</Typography>
        <Button size="small" onClick={() => navigate('/sessions')}>View All</Button>
      </Box>

      {loading && sessions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography>Loading sessions...</Typography>
        </Paper>
      ) : sessions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'transparent', boxShadow: 'none' }}>
          <Typography variant="h6" color="text.secondary">No sessions found.</Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate('/sessions/create')} sx={{ mt: 2 }}>
            Create your first session
          </Button>
        </Paper>
      ) : (
        <SessionTable
          sessions={sessions.slice(0, 5)}
          onView={(id) => navigate(`/sessions/${id}`)}
          onDuplicate={handleDuplicate}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 'bold' }}>
          {"Delete Session?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to permanently delete this session? This action cannot be undone and all attendance records for this session will be archived.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleDeleteCancel} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus sx={{ borderRadius: 2 }}>
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>


    </Container>
  );
}
