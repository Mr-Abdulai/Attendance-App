import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', { email });
      const response = await authService.login({ email, password });
      console.log('Login response:', response);

      if (response.user.role !== 'LECTURER') {
        setError('Only lecturers can access this portal');
        setLoading(false);
        return;
      }

      login(response.user, response.accessToken, response.refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);

      // Better error messages
      let errorMessage = 'Login failed. Please try again.';

      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running on http://localhost:5000';
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.error || 'Invalid request. Please check your input.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 5,
            width: '100%',
            borderRadius: 4,
            background: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #58A6FF 0%, #BC8CFF 100%)'
                  : 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}
            >
              Mobile Attendance
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Lecturer Portal
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
              placeholder="lecturer@university.edu"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                textTransform: 'none',
                borderRadius: 3,
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 3 }}>
                <CircularProgress size={20} thickness={4} />
                <Typography variant="body2" color="text.secondary">
                  Verifying credentials...
                </Typography>
              </Box>
            )}
          </form>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Need an account?{' '}
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Please contact your university administrator to request access.');
                }}
                sx={{
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Contact Administrator
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

