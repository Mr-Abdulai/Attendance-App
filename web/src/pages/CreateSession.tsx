import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { sessionService } from '../services/sessionService';
import { courseService } from '../services/courseService';
import QRCodeDisplay from '../components/QRCodeDisplay';

export default function CreateSession() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const duplicateId = searchParams.get('duplicate');

  // Session State
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [session, setSession] = useState<any>(null);
  const [locationError, setLocationError] = useState('');
  const [cachedPosition, setCachedPosition] = useState<GeolocationPosition | null>(null);

  // Course State
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [createCourseOpen, setCreateCourseOpen] = useState(false);

  // Independent State for New Course Dialog
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [courseError, setCourseError] = useState('');

  // Load courses
  useEffect(() => {
    courseService.getCourses()
      .then(data => setCourses(data.courses))
      .catch(err => console.error('Failed to load courses', err));
  }, []);

  useEffect(() => {
    if (duplicateId) {
      setLoading(true);
      sessionService.getSession(duplicateId)
        .then((data) => {
          setName(`${data.session.name} (Copy)`);
        })
        .catch((err) => {
          console.error('Failed to duplicate session details', err);
          setError('Failed to load session to duplicate');
        })
        .finally(() => setLoading(false));
    }
  }, [duplicateId]);

  // Reset session state when component mounts
  useEffect(() => {
    setSession(null);
    setName('');
    setError('');
    setLocationError('');

    // Pre-fetch location
    getLocation()
      .then((pos) => {

        setCachedPosition(pos);
      })
      .catch((err) => {

      });
  }, []);

  const getLocation = async (): Promise<GeolocationPosition> => {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by your browser');
    }

    const getPosition = (options: PositionOptions): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });
    };

    try {
      // Try high accuracy first
      return await getPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    } catch (error: any) {
      console.warn('High accuracy location failed, trying low accuracy...', error);
      // Fallback to low accuracy
      if (error.code === 3 || error.code === 2) { // Timeout or Unavailable
        return await getPosition({
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 0
        });
      }
      throw error;
    }
  };

  const handleCreateCourse = async () => {
    if (!newCourseName.trim() || !newCourseCode.trim()) return;
    setCreatingCourse(true);
    setCourseError('');
    try {
      const { course } = await courseService.createCourse({
        name: newCourseName,
        code: newCourseCode
      });
      setCourses(prev => [course, ...prev]);
      setSelectedCourseId(course.id); // Auto-select new course
      setCreateCourseOpen(false);

      // Clear inputs
      setNewCourseName('');
      setNewCourseCode('');
    } catch (err: any) {
      setCourseError(err.response?.data?.error || 'Failed to create course');
    } finally {
      setCreatingCourse(false);
    }
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
      const position = cachedPosition || await getLocation();
      const { latitude, longitude } = position.coords;



      const response = await sessionService.createSession({
        name: name.trim(),
        courseId: selectedCourseId || undefined, // Add courseId
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
    <Container maxWidth="md" sx={{ py: 4 }}>
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

        {cachedPosition && cachedPosition.coords.accuracy > 100 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            ⚠️ <strong>Low Accuracy Detected</strong>
            <br />
            Your location is accurate to within <strong>{Math.round(cachedPosition.coords.accuracy)} meters</strong>.
            <br />
            This may cause issues for students trying to scan. Consider using a mobile device or ensuring Wi-Fi is enabled for better accuracy.
          </Alert>
        )}

        {cachedPosition && (
          <Typography variant="caption" display="block" sx={{ mb: 2, color: 'text.secondary' }}>
            📍 Current Location Accuracy: ±{Math.round(cachedPosition.coords.accuracy)}m
          </Typography>
        )}

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              select
              fullWidth
              label="Course (Optional)"
              value={selectedCourseId}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'NEW') {
                  setCreateCourseOpen(true);
                } else {
                  setSelectedCourseId(val);
                }
              }}
              SelectProps={{
                native: true
              }}
              InputLabelProps={{
                shrink: true,
              }}
            >
              <option value=""> General Session (No Course) </option>
              <option value="NEW"> Create New Course...</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </TextField>
          </Box>
        </Box>

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

      {/* Dialog for New Course */}
      <Dialog open={createCourseOpen} onClose={() => setCreateCourseOpen(false)}>
        <DialogTitle>Create New Course</DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>
            Create a container for your sessions (e.g., "CS101").
          </DialogContentText>

          {courseError && (
            <Alert severity="error" sx={{ mb: 2 }}>{courseError}</Alert>
          )}

          <TextField
            autoFocus
            margin="dense"
            label="Course Code"
            placeholder="e.g. CS101"
            fullWidth
            value={newCourseCode}
            onChange={(e) => setNewCourseCode(e.target.value.toUpperCase())}
            variant="outlined"
          />
          <TextField
            margin="dense"
            label="Course Name"
            placeholder="e.g. Intro to Computer Science"
            fullWidth
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
            variant="outlined"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setCreateCourseOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateCourse}
            disabled={creatingCourse || !newCourseCode || !newCourseName}
            variant="contained"
          >
            {creatingCourse ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
