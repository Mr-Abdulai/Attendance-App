import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    useTheme,
    useMediaQuery,
    Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Assessment as AnalyticsIcon,
    ListAlt as SessionsIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon,
    ChevronLeft as ChevronLeftIcon,
    Book as ClassIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useThemeContext } from '../contexts/ThemeContext';

const DRAWER_WIDTH = 240;

export default function Layout() {
    const { user, logout } = useAuth();
    const { mode, toggleColorMode } = useThemeContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();

    const [open, setOpen] = useState(!isMobile);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const toggleDrawer = () => {
        setOpen(!open);
    };

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
    };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
        { text: 'Sessions', icon: <SessionsIcon />, path: '/sessions' },
        { text: 'Courses', icon: <ClassIcon />, path: '/courses' },
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    bgcolor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    boxShadow: 1,
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={toggleDrawer}
                        edge="start"
                        sx={{ marginRight: 5 }}
                    >
                        {open ? <ChevronLeftIcon /> : <MenuIcon />}
                    </IconButton>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        onClick={() => navigate('/dashboard')}
                        sx={{
                            flexGrow: 1,
                            fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            cursor: 'pointer',
                            '&:hover': {
                                opacity: 0.8
                            }
                        }}
                    >
                        AttendancePro
                    </Typography>

                    <IconButton onClick={toggleColorMode} color="inherit" sx={{ mr: 1 }}>
                        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                    </IconButton>

                    <Box>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                                {user?.name?.charAt(0) || 'U'}
                            </Avatar>
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem disabled>{user?.name}</MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon>
                                    <LogoutIcon fontSize="small" />
                                </ListItemIcon>
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer
                variant={isMobile ? "temporary" : "permanent"}
                open={open}
                onClose={toggleDrawer}
                sx={{
                    width: open ? DRAWER_WIDTH : (isMobile ? 0 : 65),
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: open ? DRAWER_WIDTH : 65,
                        boxSizing: 'border-box',
                        whiteSpace: 'nowrap',
                        transition: theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                        overflowX: 'hidden',
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ overflowX: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', mt: 2 }}>
                    <List sx={{ flexGrow: 1 }}>
                        {menuItems.map((item) => (
                            <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 1 }}>
                                <ListItemButton
                                    sx={{
                                        minHeight: 48,
                                        justifyContent: open ? 'initial' : 'center',
                                        px: 2.5,
                                        mx: 1,
                                        borderRadius: 2,
                                        bgcolor: location.pathname === item.path ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                        color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                                    }}
                                    onClick={() => navigate(item.path)}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            mr: open ? 3 : 'auto',
                                            justifyContent: 'center',
                                            color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                                        }}
                                    >
                                        <Tooltip title={open ? '' : item.text} placement="right">
                                            {item.icon}
                                        </Tooltip>
                                    </ListItemIcon>
                                    <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>

                    {/* Settings - Bottom position */}
                    <List>
                        <ListItem disablePadding sx={{ display: 'block', mb: 1 }}>
                            <ListItemButton
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 2.5,
                                    mx: 1,
                                    borderRadius: 2,
                                }}
                                onClick={() => navigate('/settings')}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Tooltip title={open ? '' : 'Settings'} placement="right">
                                        <SettingsIcon />
                                    </Tooltip>
                                </ListItemIcon>
                                <ListItemText primary="Settings" sx={{ opacity: open ? 1 : 0 }} />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` }, minHeight: '100vh', overflowX: 'hidden' }}>
                <Toolbar />
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    style={{ width: '100%' }}
                >
                    <Outlet />
                </motion.div>
            </Box>
        </Box>
    );
}
