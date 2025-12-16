import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, ActivityIndicator, useTheme } from 'react-native-paper';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="displayMedium" style={[styles.title, { color: theme.colors.primary }]}>
          Mobile Attendance
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          University System
        </Text>
        
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" animating={true} color={theme.colors.primary} />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Starting up...
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    width: width * 0.8,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
  },
  loaderContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#888',
  },
});
