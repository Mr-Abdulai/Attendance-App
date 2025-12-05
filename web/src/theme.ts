import { createTheme, alpha } from '@mui/material/styles';

// Vibrant Academic Palette
const colors = {
    primary: {
        main: '#4F46E5', // Indigo
        light: '#818CF8',
        dark: '#3730A3',
    },
    secondary: {
        main: '#7C3AED', // Violet
        light: '#A78BFA',
        dark: '#5B21B6',
    },
    background: {
        default: '#F3F4F6',
        paper: '#FFFFFF',
    },
    text: {
        primary: '#111827',
        secondary: '#4B5563',
    },
};

export const theme = createTheme({
    palette: {
        primary: colors.primary,
        secondary: colors.secondary,
        background: colors.background,
        text: colors.text,
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: { fontWeight: 600, textTransform: 'none' },
    },
    shape: {
        borderRadius: 16,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    background: 'linear-gradient(135deg, #F3F4F6 0%, #E0E7FF 100%)',
                    minHeight: '100vh',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: alpha('#FFFFFF', 0.8),
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: '10px 24px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
                    },
                },
                containedPrimary: {
                    background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                    '&:hover': {
                        background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.secondary.dark} 100%)`,
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 20,
                    backgroundColor: alpha('#FFFFFF', 0.7),
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                        backgroundColor: alpha('#FFFFFF', 0.5),
                        '& fieldset': {
                            borderColor: alpha(colors.primary.main, 0.2),
                        },
                        '&:hover fieldset': {
                            borderColor: colors.primary.main,
                        },
                    },
                },
            },
        },
    },
});
