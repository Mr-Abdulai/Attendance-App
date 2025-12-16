import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { authService } from '../services/authService';
import { User } from '../types';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ScannerScreen from '../screens/ScannerScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SplashScreen from '../screens/SplashScreen';
import { attendanceService } from '../services/attendanceService'; // Ensure we can pass attendance
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons'; // Assuming Expo, or use react-native-vector-icons

import { NavigatorScreenParams } from '@react-navigation/native';

// Define Dashboard Stack params
export type DashboardStackParamList = {
  Dashboard: { newAttendance?: any } | undefined;
};

export type MainTabParamList = {
  Home: NavigatorScreenParams<DashboardStackParamList>;
  Archive: { filter: string };
  Profile: undefined;
};

// Add FullHistory to the main stack so we can navigate to it from Dashboard
// Not strictly a tab, but part of the content. Or we can just use the same Screen component in Stack.
export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  Scanner: undefined;
  FullHistory: { filter: string }; // New Route
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// --- Home Stack (Dashboard) ---
// We keep Dashboard in a stack in case we simple push navigation later,
// but usually it's just the DashboardScreen.
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
function HomeStackNavigator({ user, onUpdateUser, onLogout }: any) {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="Dashboard">
        {(props) => <DashboardScreen
          {...props}
          user={user}
          onUpdateUser={onUpdateUser}
          onLogout={onLogout}
        />}
      </DashboardStack.Screen>
    </DashboardStack.Navigator>
  );
}


// --- Main Tabs ---
function MainTabs({ user, onUpdateUser, onLogout }: any) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopColor: '#333',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#A1A1AA',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Archive') {
            iconName = focused ? 'archive' : 'archive-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home">
        {() => <HomeStackNavigator user={user} onUpdateUser={onUpdateUser} onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen
        name="Archive"
        component={HistoryScreen}
        initialParams={{ filter: 'archived' }}
      />
      <Tab.Screen name="Profile">
        {() => (
          <ProfileScreen
            user={user}
            onUpdateUser={onUpdateUser}
            onLogout={onLogout}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // We need to fetch attendance for ProfileScreen if we pass it down, 
  // or ProfileScreen should fetch its own stats. 
  // For now, let's keep it simple and maybe refactor ProfileScreen to fetch on mount.

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Auth check timed out')), 5000);
      });

      await Promise.race([
        (async () => {
          const storedUser = await authService.getStoredUser();
          if (storedUser) {
            try {
              const { user } = await authService.getProfile();
              setUser(user);
            } catch {
              await authService.logout();
              setUser(null);
            }
          }
        })(),
        timeoutPromise
      ]);
    } catch (error) {
      console.error('Auth check error:', error);
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
          <Stack.Screen name="Main">
            {(props) => <MainTabs
              {...props}
              user={user}
              onUpdateUser={setUser}
              onLogout={async () => {
                await authService.logout();
                setUser(null);
              }}
            />}
          </Stack.Screen>
          <Stack.Screen name="Scanner" component={ScannerScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen
            name="FullHistory"
            component={HistoryScreen}
            initialParams={{ filter: 'all' }}
            options={{ headerShown: false }} // HistoryScreen has its own header
          />
        </>
      ) : (
        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} onLogin={(user) => setUser(user)} />}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}

