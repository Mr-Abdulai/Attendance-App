import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  FAB,
  ActivityIndicator,
  List,
  Divider,
} from 'react-native-paper';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { attendanceService } from '../services/attendanceService';
import { Attendance, User } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface DashboardScreenProps {
  user: User;
  onLogout: () => void;
}

export default function DashboardScreen({ user, onLogout }: DashboardScreenProps) {
  const navigation = useNavigation<NavigationProp>();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAttendance = async () => {
    try {
      const data = await attendanceService.getAttendanceHistory();
      setAttendance(data.attendance);
    } catch (error: any) {
      console.error('Failed to load attendance:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadAttendance();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VALID':
        return '#4caf50';
      case 'OUT_OF_RANGE':
        return '#ff9800';
      case 'INVALID':
      case 'EXPIRED':
      case 'DUPLICATE':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.welcomeText}>
            Welcome, {user.name}
          </Text>
          <Text variant="bodyMedium" style={styles.emailText}>
            {user.email}
          </Text>
          <Button
            mode="outlined"
            onPress={onLogout}
            style={styles.logoutButton}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Attendance History
        </Text>

        {loading ? (
          <ActivityIndicator style={styles.loader} />
        ) : attendance.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No attendance records yet
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                Scan a QR code to mark your attendance
              </Text>
            </Card.Content>
          </Card>
        ) : (
          attendance.map((item, index) => (
            <Card key={item.id} style={styles.attendanceCard}>
              <Card.Content>
                <View style={styles.attendanceHeader}>
                  <Text variant="titleMedium" style={styles.sessionName}>
                    {item.session.name}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(item.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
                <Divider style={styles.divider} />
                <List.Item
                  title="Scanned At"
                  description={format(new Date(item.scannedAt), 'PPp')}
                  left={(props) => <List.Icon {...props} icon="clock-outline" />}
                />
                <List.Item
                  title="Distance"
                  description={`${item.distance.toFixed(2)} meters`}
                  left={(props) => <List.Icon {...props} icon="map-marker-distance" />}
                />
                {item.session.lecturer && (
                  <List.Item
                    title="Lecturer"
                    description={item.session.lecturer.name}
                    left={(props) => <List.Icon {...props} icon="account" />}
                  />
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        icon="qrcode-scan"
        style={styles.fab}
        onPress={() => navigation.navigate('Scanner')}
        label="Scan QR Code"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 16,
    elevation: 2,
  },
  welcomeText: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emailText: {
    color: '#666',
    marginBottom: 12,
  },
  logoutButton: {
    alignSelf: 'flex-start',
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 40,
  },
  emptyCard: {
    margin: 16,
    elevation: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#666',
  },
  attendanceCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionName: {
    flex: 1,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

