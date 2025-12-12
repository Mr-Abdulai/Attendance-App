import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Button,
    Paper,
    IconButton
} from '@mui/material';
import {
    Add as AddIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import SessionTable from '../components/dashboard/SessionTable';
import { sessionService, Session } from '../services/sessionService';

export default function Sessions() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

    // Re-using the delete dialog logic or importing it? 
    // For now, I'll allow viewing/duplicating. Deleting might need the dialog logic duplicated or moved to a context/component.
    // I'll keep it simple: View and Duplicate work. Delete I'll implement if requested or reuse the Dialog.

    const [searchParams] = useSearchParams();
    const courseId = searchParams.get('courseId');

    const loadSessions = async () => {
        setLoading(true);
        try {
            const data = await sessionService.getLecturerSessions();
            let sessionsData = data.sessions;

            if (courseId) {
                sessionsData = sessionsData.filter(s => s.courseId === courseId || s.course?.id === courseId);
            }

            setSessions(sessionsData);
        } catch (error) {
            console.error('Failed to load sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSessions();
    }, [courseId]); // Reload when courseId changes

    const handleDuplicate = (session: Session) => {
        navigate(`/sessions/create?duplicate=${session.id}`);
    };

    const handleDeleteClick = (id: string) => {
        // Placeholder: To be fully implemented with Dialog
        if (window.confirm("Are you sure you want to delete this session?")) {
            sessionService.deleteSession(id).then(() => {
                setSessions(prev => prev.filter(s => s.id !== id));
            });
        }
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">
                    {courseId ? 'Course Sessions' : 'All Sessions'}
                    {courseId && (
                        <Button
                            color="primary"
                            size="small"
                            onClick={() => navigate('/sessions')}
                            sx={{ ml: 2 }}
                        >
                            Show All
                        </Button>
                    )}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <IconButton onClick={loadSessions} disabled={loading}>
                        <RefreshIcon />
                    </IconButton>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/sessions/create')}
                        sx={{ borderRadius: 2 }}
                    >
                        New Session
                    </Button>
                </Box>
            </Box>

            {loading ? (
                <Typography>Loading...</Typography>
            ) : sessions.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">No sessions found.</Typography>
                </Paper>
            ) : (
                <SessionTable
                    sessions={sessions}
                    onView={(id) => navigate(`/sessions/${id}`)}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDeleteClick}
                />
            )}
        </Container>
    );
}
