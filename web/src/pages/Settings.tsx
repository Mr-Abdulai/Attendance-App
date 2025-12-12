import { Container, Typography, Paper, Box, Avatar, Divider, Switch, Button } from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Badge as BadgeIcon,
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useThemeContext } from '../contexts/ThemeContext';

export default function Settings() {
    const { user, logout } = useAuth();
    const { mode, toggleColorMode } = useThemeContext();

    if (!user) return null;

    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const DetailRow = ({ icon, label, value }: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{ color: 'primary.main', mr: 2 }}>{icon}</Box>
            <Box>
                <Typography variant="caption" display="block" color="text.secondary">
                    {label}
                </Typography>
                <Typography variant="body1" fontWeight="medium">{value}</Typography>
            </Box>
        </Box>
    );

    return (
        <Container maxWidth="md">
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
                Settings
            </Typography>

            <Paper sx={{ p: 4, borderRadius: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Avatar
                        sx={{
                            width: 80,
                            height: 80,
                            bgcolor: 'primary.main',
                            fontSize: '2rem',
                            mr: 3
                        }}
                    >
                        {initials}
                    </Avatar>
                    <Box>
                        <Typography variant="h5" fontWeight="bold">
                            {user.name}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {user.role} Account
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ mb: 4 }} />

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <DetailRow
                        icon={<EmailIcon />}
                        label="Email Address"
                        value={user.email}
                    />
                    <DetailRow
                        icon={<BadgeIcon />}
                        label="Role"
                        value={user.role}
                    />
                    <DetailRow
                        icon={<PersonIcon />}
                        label="User ID"
                        value={user.id}
                    />
                </Box>
            </Paper>

            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Preferences
            </Typography>
            <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {mode === 'dark' ? <DarkModeIcon sx={{ mr: 2 }} /> : <LightModeIcon sx={{ mr: 2 }} />}
                        <Box>
                            <Typography variant="subtitle1" fontWeight="medium">Dark Mode</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Switch between light and dark themes
                            </Typography>
                        </Box>
                    </Box>
                    <Switch checked={mode === 'dark'} onChange={toggleColorMode} />
                </Box>
            </Paper>

            <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={logout}
                size="large"
                sx={{ borderRadius: 2 }}
            >
                Sign Out
            </Button>

        </Container>
    );
}
