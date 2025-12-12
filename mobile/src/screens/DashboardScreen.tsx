import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FAB, useTheme } from 'react-native-paper';
import { RootStackParamList } from '../navigation/AppNavigator';
import { attendanceService } from '../services/attendanceService';
import { storageService } from '../services/storageService';
import { Attendance, User } from '../types';
import DashboardHeader from '../components/DashboardHeader';
import StatsOverview from '../components/StatsOverview';
import AttendanceList from '../components/AttendanceList';
import AttendanceDetailModal from '../components/AttendanceDetailModal';
import { useSocket } from '../hooks/useSocket';
import ReceiptSheet from '../components/ReceiptSheet';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface DashboardScreenProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
  route: any; // Add route prop type
}

export default function DashboardScreen({ user, onLogout, onUpdateUser, route }: DashboardScreenProps) {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [newReceipt, setNewReceipt] = useState<Attendance | null>(null);

  // Archive state
  const [archivedIds, setArchivedIds] = useState<string[]>([]);

  const loadAttendance = async () => {
    try {
      const [data, archived] = await Promise.all([
        attendanceService.getAttendanceHistory(10), // Limit to 10 recent
        storageService.getArchivedSessions(),
      ]);
      setArchivedIds(archived);
      setAttendance(data.attendance);
    } catch (error: any) {
      console.error('Failed to load attendance:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadAttendance();
    }, [])
  );

  // Check for new attendance passed from Scanner
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.newAttendance) {
        setNewReceipt(route.params.newAttendance);
        // Clear param so it doesn't show again on simple focus
        navigation.setParams({ newAttendance: undefined } as any);
      }
    }, [route.params])
  );

  // Listen for real-time updates
  // We explicitly join the user's personal room to receive notification
  // about manual attendance updates targeting this specific user.
  useSocket(user ? `user:${user.id}` : null, (data) => {
    // Refresh attendance when we receive an update
    console.log('Received attendance update via socket', data);
    loadAttendance();

    // If it's a manual update, show the receipt!
    if (data.attendance && data.attendance.type === 'MANUAL') {
      setNewReceipt(data.attendance);
    }
  });

  const onRefresh = () => {
    setRefreshing(true);
    loadAttendance();
  };

  const handleArchive = async (item: Attendance) => {
    await storageService.archiveSession(item.id);
    loadAttendance();
  };

  const displayedAttendance = attendance.filter(a => !archivedIds.includes(a.id));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <DashboardHeader
        user={user}
        attendanceCount={attendance.length}
        successCount={attendance.filter(a => a.status === 'VALID').length}
        onLogout={onLogout}
        onProfilePress={() => navigation.navigate('Main', { screen: 'Profile' })}
        onArchivePress={() => navigation.navigate('Main', { screen: 'Archive' })}
        onHistoryPress={() => navigation.navigate('FullHistory')}
      />

      <AttendanceList
        attendance={displayedAttendance}
        loading={loading}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onItemPress={setSelectedAttendance}
        onArchive={handleArchive}
      />

      <FAB
        icon="qrcode-scan"
        style={styles.fab}
        color="#fff"
        onPress={() => navigation.navigate('Scanner')}
      />

      {/* Interactive Modals */}
      <AttendanceDetailModal
        visible={!!selectedAttendance}
        onDismiss={() => setSelectedAttendance(null)}
        attendance={selectedAttendance}
      />

      <ReceiptSheet
        visible={!!newReceipt}
        onDismiss={() => setNewReceipt(null)}
        attendance={newReceipt}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196f3',
    borderRadius: 16,
  },
});
