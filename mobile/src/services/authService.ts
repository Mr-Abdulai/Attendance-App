import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginData, RegisterData } from '../types';

export interface LoginResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async login(data: LoginData): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('accessToken');
  },

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/register', data);
    return response.data;
  },

  async updateProfile(studentId: string): Promise<{ user: User }> {
    const response = await api.put<{ user: User }>('/auth/profile', { studentId });
    return response.data;
  },

  async getProfile(): Promise<{ user: User }> {
    const response = await api.get<{ user: User }>('/auth/profile');
    return response.data;
  },

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  },

  async getStoredUser(): Promise<User | null> {
    try {
      const userStr = await AsyncStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  async storeAuthData(user: User, accessToken: string, refreshToken: string): Promise<void> {
    await AsyncStorage.multiSet([
      ['user', JSON.stringify(user)],
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
    ]);
  },
};

