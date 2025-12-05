import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { sessionService } from '../services/sessionService';
import QRCodeDisplay from '../components/QRCodeDisplay';

export default function CreateSession() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [session, setSession] = useState<any>(null);
  const [locationError, setLocationError] = useState('');

  // Reset session state when component mounts (e.g., when returning to create session page)
  useEffect(() => {
    setSession(null);
    setName('');
    setError('');
    setLocationError('');
  }, []);

  const getLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      // Request with high accuracy and timeout options
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          console.error('Geolocation error:', error);
          if (error.code === 1) {
            reject(new Error('Location permission denied. Please allow location access to create sessions.'));
          } else if (error.code === 2) {
            reject(new Error('Location unavailable. Please check your device settings.'));
          } else if (error.code === 3) {
            reject(new Error('Location request timed out. Please try again.'));
          } else {
            reject(error);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0 // Don't use cached location
        }
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLocationError('');

    if (!name.trim()) {
      setError('Session name is required');
      return;
    }

    setLoading(true);

    try {
      const position = await getLocation();
      const { latitude, longitude } = position.coords;
      
      console.log('📍 Lecturer location obtained:', {
        latitude,
        longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(position.timestamp).toISOString()
      });

      const response = await sessionService.createSession({
        name: name.trim(),
        latitude,
        longitude,
      });

      setSession(response.session);
    } catch (err: any) {
      if (err.message?.includes('Geolocation')) {
        setLocationError('Please enable location access to create a session');
      } else {
        setError(err.response?.data?.error || 'Failed to create session. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (session) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        <QRCodeDisplay session={session} onEndSession={() => navigate('/dashboard')} />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/dashboard')}
        sx={{ mb: 2 }}
      >
        Back to Dashboard
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Create New Session
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Create an attendance session for your class. You'll need to allow location access.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {locationError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {locationError}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Session Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
            placeholder="e.g., CS101 - Introduction to Programming"
            helperText="Enter a descriptive name for this attendance session"
          />

          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              size="large"
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Creating Session...
                </>
              ) : (
                'Create Session'
              )}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

