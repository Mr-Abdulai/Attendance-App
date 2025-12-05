import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  ActivityIndicator,
} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { authService } from '../services/authService';
import { User } from '../types';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill in all fields',
      });
      return;
    }

    if (isRegister && !name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter your name',
      });
      return;
    }

    setLoading(true);

    try {
      let response;
      if (isRegister) {
        response = await authService.register({
          email: email.trim(),
          password,
          name: name.trim(),
          role: 'STUDENT',
        });
      } else {
        response = await authService.login({
          email: email.trim(),
          password,
        });
      }

      if (response.user.role !== 'STUDENT') {
        Toast.show({
          type: 'error',
          text1: 'Access Denied',
          text2: 'This app is for students only',
        });
        setLoading(false);
        return;
      }

      await authService.storeAuthData(
        response.user,
        response.accessToken,
        response.refreshToken
      );

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: isRegister ? 'Account created successfully!' : 'Login successful!',
      });

      onLogin(response.user);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'An error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.title}>
              Attendance App
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {isRegister ? 'Create your account' : 'Sign in to mark attendance'}
            </Text>

            {isRegister && (
              <TextInput
                label="Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
                autoCapitalize="words"
              />
            )}

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry
              autoComplete="password"
            />

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                isRegister ? 'Register' : 'Sign In'
              )}
            </Button>

            <Button
              mode="text"
              onPress={() => setIsRegister(!isRegister)}
              style={styles.switchButton}
            >
              {isRegister
                ? 'Already have an account? Sign in'
                : "Don't have an account? Register"}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
  switchButton: {
    marginTop: 16,
  },
});

