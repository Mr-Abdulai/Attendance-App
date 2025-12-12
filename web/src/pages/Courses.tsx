import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
    Alert,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    CardActions,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    useTheme,
    alpha,
    Paper,
} from '@mui/material';
import {
    Add as AddIcon,
    Book as ClassIcon,
    MoreVert as MoreVertIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    School as SchoolIcon,
} from '@mui/icons-material';
import { courseService, Course } from '../services/courseService';

export default function Courses() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Create Dialog State
    const [openCreate, setOpenCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [newCode, setNewCode] = useState('');
    const [creating, setCreating] = useState(false);

    // Delete Dialog State
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Menu State
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [menuCourse, setMenuCourse] = useState<Course | null>(null);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            setLoading(true);
            const data = await courseService.getCourses();
            setCourses(data.courses);
        } catch (err) {
            setError('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newName.trim() || !newCode.trim()) return;
        setCreating(true);
        try {
            const { course } = await courseService.createCourse({
                name: newName,
                code: newCode
            });
            setCourses([course, ...courses]);
            setOpenCreate(false);
            setNewName('');
            setNewCode('');
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to create course');
        } finally {
            setCreating(false);
        }
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, course: Course) => {
        setMenuAnchor(event.currentTarget);
        setMenuCourse(course);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setMenuCourse(null);
    };

    const handleDeleteClick = () => {
        if (menuCourse) {
            setSelectedCourse(menuCourse);
            setOpenDelete(true);
            handleMenuClose();
        }
    };

    const confirmDelete = async () => {
        if (!selectedCourse) return;
        setDeleting(true);
        try {
            await courseService.deleteCourse(selectedCourse.id);
            setCourses(courses.filter(c => c.id !== selectedCourse.id));
            setOpenDelete(false);
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to delete course');
        } finally {
            setDeleting(false);
            setSelectedCourse(null);
        }
    };

    // Generate a distinct gradient based on the course code character
    const getGradient = (code: string) => {
        const charCode = code.charCodeAt(0) || 65;
        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Blue/Purple
            'linear-gradient(135deg, #FF6B6B 0%, #556270 100%)', // Red/Gray
            'linear-gradient(135deg, #fcb045 0%, #fd1d1d 50%, #833ab4 100%)', // Orange/Red/Purple
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green/Teal
            'linear-gradient(135deg, #654ea3 0%, #eaafc8 100%)', // Purple/Pink
        ];
        return gradients[charCode % gradients.length];
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <div>
                    <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                        Courses
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your courses and view session statistics
                    </Typography>
                </div>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenCreate(true)}
                    size="large"
                    sx={{ borderRadius: 2 }}
                >
                    Add Course
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ p: 8, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : courses.length === 0 ? (
                <Paper
                    elevation={0}
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        bgcolor: 'transparent',
                        border: '2px dashed ' + theme.palette.divider,
                        borderRadius: 4
                    }}
                >
                    <SchoolIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No courses found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Create your first course to start organizing your sessions.
                    </Typography>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
                        Create Course
                    </Button>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {courses.map((course) => (
                        <Grid item xs={12} sm={6} md={4} key={course.id}>
                            <Card
                                elevation={2}
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: 3,
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 6,
                                        cursor: 'pointer'
                                    },
                                    position: 'relative',
                                    overflow: 'visible'
                                }}
                                onClick={() => navigate(`/sessions?courseId=${course.id}`)}
                            >
                                {/* Header Gradient */}
                                <Box
                                    sx={{
                                        height: 8,
                                        background: getGradient(course.code),
                                        borderTopLeftRadius: 12,
                                        borderTopRightRadius: 12,
                                    }}
                                />

                                <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Chip
                                            label={course.code}
                                            color="primary"
                                            size="small"
                                            sx={{ fontWeight: 'bold', mb: 2, borderRadius: 1.5 }}
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMenuOpen(e, course);
                                            }}
                                            aria-label="settings"
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </Box>

                                    <Typography variant="h6" component="h2" gutterBottom fontWeight="600">
                                        {course.name}
                                    </Typography>

                                    {course.description && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                            {course.description}
                                        </Typography>
                                    )}

                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 1 }}>
                                        <ClassIcon fontSize="small" color="action" />
                                        <Typography variant="body2" color="text.secondary">
                                            {course._count?.sessions || 0} Sessions
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
                PaperProps={{
                    elevation: 3,
                    sx: { borderRadius: 2, minWidth: 150 }
                }}
            >
                <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    Delete
                </MenuItem>
            </Menu>

            {/* Create Dialog */}
            <Dialog
                open={openCreate}
                onClose={() => setOpenCreate(false)}
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ pb: 1 }}>Add New Course</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Create a container for your sessions.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Course Code (e.g. CS101)"
                        fullWidth
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Course Name (e.g. Intro to Computer Science)"
                        fullWidth
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setOpenCreate(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
                    <Button
                        onClick={handleCreate}
                        variant="contained"
                        disabled={creating}
                        sx={{ borderRadius: 2 }}
                    >
                        {creating ? 'Creating...' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog
                open={openDelete}
                onClose={() => setOpenDelete(false)}
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle>Delete Course?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <strong>{selectedCourse?.code}</strong>?
                    </Typography>
                    <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                        Past sessions will be preserved but unlinked.
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setOpenDelete(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
                    <Button
                        onClick={confirmDelete}
                        color="error"
                        variant="contained"
                        disabled={deleting}
                        startIcon={<DeleteIcon />}
                        sx={{ borderRadius: 2 }}
                    >
                        {deleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
