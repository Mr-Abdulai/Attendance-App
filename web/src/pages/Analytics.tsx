import { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import StatsOverview from '../components/dashboard/StatsOverview';
import { sessionService, Session } from '../services/sessionService';

export default function Analytics() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await sessionService.getLecturerSessions();
                setSessions(data.sessions);
            } catch (error) {
                console.error('Failed to load analytics data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl">
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
                Analytics
            </Typography>
            <StatsOverview sessions={sessions} />
        </Container>
    );
}
