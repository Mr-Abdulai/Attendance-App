import api from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'LECTURER' | 'ADMIN';
}

export interface LoginResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'STUDENT' | 'LECTURER';
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  async login(data: LoginData): Promise<LoginResponse> {
    console.log('Calling login API with:', data);
    try {
      const response = await api.post<LoginResponse>('/auth/login', data);
      console.log('Login API response:', response);
      return response.data;
    } catch (error: any) {
      console.error('Login API error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/register', data);
    return response.data;
  },

  async getProfile(): Promise<{ user: User }> {
    const response = await api.get<{ user: User }>('/auth/profile');
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
};

