import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    MD3DarkTheme,
    MD3LightTheme,
    Provider as PaperProvider,
    adaptNavigationTheme,
} from 'react-native-paper';
import {
    DarkTheme as NavigationDarkTheme,
    DefaultTheme as NavigationDefaultTheme,
    ThemeProvider as NavigationProvider,
} from '@react-navigation/native';

const { LightTheme, DarkTheme } = adaptNavigationTheme({
    reactNavigationLight: NavigationDefaultTheme,
    reactNavigationDark: NavigationDarkTheme,
});

const CombinedDefaultTheme = {
    ...MD3LightTheme,
    ...LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        ...LightTheme.colors,
        primary: '#4F46E5', // Indigo
        background: '#F4F6F8',
        surface: '#FFFFFF',
        error: '#D32F2F',
    },
};

const CombinedDarkTheme = {
    ...MD3DarkTheme,
    ...DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        ...DarkTheme.colors,
        primary: '#3B82F6', // Blue
        secondary: '#A1A1AA', // Grey for secondary elements
        background: '#121212', // Very dark charcoal
        surface: '#1E1E1E', // Lighter grey for cards
        surfaceVariant: '#1E1E1E', // Match surface for variation
        onSurface: '#FFFFFF', // Text Primary
        onSurfaceVariant: '#A1A1AA', // Text Secondary
        error: '#EF4444',
        success: '#4ADE80', // Green
        elevation: {
            level0: 'transparent',
            level1: '#1E1E1E',
            level2: '#1E1E1E',
            level3: '#252525', // Slightly lighter for higher elevation if needed
            level4: '#252525',
            level5: '#2C2C2C',
        },
    },
};

type ThemeContextType = {
    isDark: boolean;
    toggleTheme: () => void;
    theme: any;
};

export const ThemeContext = createContext<ThemeContextType>({
    isDark: false,
    toggleTheme: () => { },
    theme: CombinedDefaultTheme,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const colorScheme = useColorScheme();
    const [isDark, setIsDark] = useState(colorScheme === 'dark');

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('themeMode');
            if (savedTheme !== null) {
                setIsDark(savedTheme === 'dark');
            }
        } catch (e) {
            console.error('Failed to load theme', e);
        }
    };

    const toggleTheme = async () => {
        const newMode = !isDark;
        setIsDark(newMode);
        try {
            await AsyncStorage.setItem('themeMode', newMode ? 'dark' : 'light');
        } catch (e) {
            console.error('Failed to save theme', e);
        }
    };

    const theme = isDark ? CombinedDarkTheme : CombinedDefaultTheme;

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
            <PaperProvider theme={theme}>
                {children}
            </PaperProvider>
        </ThemeContext.Provider>
    );
};
