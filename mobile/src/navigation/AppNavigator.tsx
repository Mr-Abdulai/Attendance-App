import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { authService } from '../services/authService';
import { User } from '../types';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ScannerScreen from '../screens/ScannerScreen';
import SplashScreen from '../screens/SplashScreen';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Scanner: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Create a timeout promise that rejects after 5 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Auth check timed out')), 5000);
      });

      // Race the auth check against the timeout
      await Promise.race([
        (async () => {
          const storedUser = await authService.getStoredUser();
          if (storedUser) {
            // Verify token is still valid
            try {
              const { user } = await authService.getProfile();
              setUser(user);
            } catch {
              // Token expired, clear storage
              await authService.logout();
              setUser(null);
            }
          }
        })(),
        timeoutPromise
      ]);
    } catch (error) {
      console.error('Auth check error:', error);
      // On timeout or error, we just let it fall through to finally
      // which sets loading=false, showing the Login screen (safe default)
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Dashboard">
            {(props) => <DashboardScreen {...props} user={user} onLogout={async () => {
              await authService.logout();
              setUser(null);
            }} />}
          </Stack.Screen>
          <Stack.Screen name="Scanner" component={ScannerScreen} />
        </>
      ) : (
        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} onLogin={(user) => setUser(user)} />}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}

