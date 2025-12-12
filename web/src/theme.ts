import { createTheme, alpha, ThemeOptions } from '@mui/material/styles';

// --- Color Palettes ---

const lightPalette = {
    primary: { main: '#4F46E5', light: '#818CF8', dark: '#3730A3' },
    secondary: { main: '#7C3AED', light: '#A78BFA', dark: '#5B21B6' },
    background: { default: '#F4F6F8', paper: '#FFFFFF' },
    text: { primary: '#202124', secondary: '#5F6368' },
    error: { main: '#D32F2F' },
    success: { main: '#2E7D32' },
    divider: '#E0E0E0',
};

const darkPalette = {
    primary: { main: '#58A6FF', light: '#79C0FF', dark: '#1F6FEB' }, // Bright Blue
    secondary: { main: '#BC8CFF', light: '#D2A8FF', dark: '#8957E5' }, // Soft Purple
    background: { default: '#0D1117', paper: '#161B22' }, // GitHub Dark Dimmed
    text: { primary: '#C9D1D9', secondary: '#8B949E' }, // Soft White & Dimmed Gray
    error: { main: '#F85149' },
    success: { main: '#3FB950' },
    divider: '#30363D',
};

// --- Shared Options ---

const typography = {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' as const },
};

const shape = { borderRadius: 12 }; // Slightly more modern radius

// --- Theme Generator ---

export const getTheme = (mode: 'light' | 'dark') => {
    const palette = mode === 'dark' ? darkPalette : lightPalette;

    return createTheme({
        palette: {
            mode,
            ...palette,
        },
        typography,
        shape,
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        backgroundColor: palette.background.default,
                        color: palette.text.primary,
                        transition: 'background-color 0.3s ease, color 0.3s ease',
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        backgroundColor: palette.background.paper,
                        border: mode === 'dark' ? '1px solid #30363D' : 'none',
                        transition: 'background-color 0.3s ease, border-color 0.3s ease',
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        textTransform: 'none',
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 16,
                        backgroundImage: 'none', // Critical for custom dark mode
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: palette.background.paper,
                        color: palette.text.primary,
                        backgroundImage: 'none',
                        borderBottom: `1px solid ${palette.divider}`,
                        boxShadow: mode === 'dark' ? 'none' : '0px 1px 3px rgba(0,0,0,0.1)',
                    },
                },
            },
        },
    });
};
