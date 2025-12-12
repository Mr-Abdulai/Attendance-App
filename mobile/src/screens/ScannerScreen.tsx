import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  Text,
  Button,
  ActivityIndicator,
  Card,
} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { attendanceService } from '../services/attendanceService';
import { locationService } from '../services/locationService';
import { Attendance } from '../types';

const { width, height } = Dimensions.get('window');

export default function ScannerScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState<Attendance | null>(null);

  // Reset scanner when screen is focused
  useEffect(() => {
    if (isFocused) {
      setScanned(false);
      setProcessing(false);
      setReceiptData(null);
    }
  }, [isFocused]);

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const [cachedLocation, setCachedLocation] = useState<{ latitude: number; longitude: number; accuracy?: number | null; timestamp: number } | null>(null);

  // Prefetch location when permission is granted
  useEffect(() => {
    let locationInterval: NodeJS.Timeout;

    const startLocationUpdates = async () => {
      if (permission?.granted) {
        try {
          // Initial fetch
          const hasPermission = await locationService.requestPermissions();
          if (hasPermission) {
            const location = await locationService.getCurrentLocation();
            setCachedLocation({ ...location, timestamp: Date.now() });
            console.log('📍 Location prefetched:', location);

            // Update every 10 seconds (faster)
            locationInterval = setInterval(async () => {
              try {
                const newLocation = await locationService.getCurrentLocation();
                setCachedLocation({ ...newLocation, timestamp: Date.now() });
                console.log('📍 Location updated:', newLocation);
              } catch (err) {
                console.log('Failed to update background location');
              }
            }, 10000);
          }
        } catch (error) {
          console.log('Failed to prefetch location:', error);
        }
      }
    };

    startLocationUpdates();

    return () => {
      if (locationInterval) clearInterval(locationInterval);
    };
  }, [permission]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || processing) return;

    setScanned(true);
    setProcessing(true);

    try {
      let location = cachedLocation;
      const isLocationFresh = location && (Date.now() - location.timestamp < 120000); // 2 minutes freshness (more aggressive)

      if (!isLocationFresh) {
        console.log('⚠️ Cached location stale or missing, fetching fresh...');
        // Request location permission and get current location
        const hasLocationPermission = await locationService.requestPermissions();
        if (!hasLocationPermission) {
          Alert.alert(
            'Location Permission Required',
            'Please enable location access to mark attendance.',
            [{ text: 'OK', onPress: () => setScanned(false) }]
          );
          setProcessing(false);
          return;
        }

        const freshLocation = await locationService.getCurrentLocation();
        location = { ...freshLocation, timestamp: Date.now() };
      } else {
        console.log('⚡ Using cached location');
      }

      if (!location) throw new Error('Could not obtain location');

      console.log('📱 Student location used:', {
        latitude: location.latitude,
        longitude: location.longitude,
        source: isLocationFresh ? 'cache' : 'fresh',
      });

      // Mark attendance
      const response = await attendanceService.markAttendance({
        qrCode: data,
        latitude: location.latitude,
        longitude: location.longitude,
      });

      setReceiptData(response.attendance);

      // Navigate immediately to Dashboard with the new receipt
      navigation.navigate('Main', {
        screen: 'Home',
        params: {
          screen: 'Dashboard',
          params: { newAttendance: response.attendance }
        }
      });

    } catch (error: any) {
      // ... catch logic ...
      // Handle duplicate attendance gracefully
      if (error.response?.status === 409 || (error.message && error.message.includes('already marked'))) {
        Toast.show({
          type: 'info',
          text1: 'Already Checked In',
          text2: 'You have already marked attendance for this session.',
          visibilityTime: 3000,
        });
        navigation.goBack();
        return;
      }

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Failed to mark attendance. Please try again.';

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
        visibilityTime: 6000,
      });

      setScanned(true);
    } finally {
      setProcessing(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Card style={styles.permissionCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.permissionTitle}>
              Camera Permission Required
            </Text>
            <Text variant="bodyMedium" style={styles.permissionText}>
              We need access to your camera to scan QR codes for attendance.
            </Text>
            <Button
              mode="contained"
              onPress={requestPermission}
              style={styles.permissionButton}
            >
              Grant Permission
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              Go Back
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Card style={styles.instructionCard}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.instructionText}>
                Position the QR code within the frame
              </Text>
              {cachedLocation?.accuracy && (
                <Text variant="bodySmall" style={{ color: cachedLocation.accuracy < 20 ? '#4caf50' : '#ff9800', textAlign: 'center', marginTop: 4 }}>
                  GPS Accuracy: ±{Math.round(cachedLocation.accuracy)}m
                </Text>
              )}
              {processing && (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="small" style={styles.processingIndicator} />
                  <Text variant="bodySmall">Processing...</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </View>
      </CameraView>

      {/* Manual Scan Again Button (Only if failed or dismissed receipt) */}
      {scanned && !processing && !receiptData && (
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => setScanned(false)}
            style={styles.scanAgainButton}
          >
            Scan Again
          </Button>
        </View>
      )}

      {scanned && !processing && !receiptData && (
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => setScanned(false)}
            style={styles.scanAgainButton}
          >
            Scan Again
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: width * 0.7,
    height: width * 0.7,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  instructionCard: {
    marginTop: 40,
    marginHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  instructionText: {
    color: '#fff',
    textAlign: 'center',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  processingIndicator: {
    marginRight: 8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  scanAgainButton: {
    paddingVertical: 4,
  },
  permissionCard: {
    margin: 20,
    elevation: 4,
  },
  permissionTitle: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  permissionButton: {
    marginBottom: 12,
  },
  backButton: {
    marginTop: 8,
  },
});

