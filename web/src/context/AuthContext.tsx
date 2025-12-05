import { createContext, useState, useEffect, ReactNode } from 'react';
import { User, authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Verify token is still valid
        authService
          .getProfile()
          .then(({ user }) => {
            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));
          })
          .catch((error) => {
            console.error('Failed to verify token:', error);
            // Only logout if it's an auth error, not a network/server error
            const status = error?.response?.status;
            if (status === 401 || status === 403) {
              authService.logout();
              setUser(null);
            }
          })
          .finally(() => setLoading(false));
      } catch {
        authService.logout();
        setUser(null);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData: User, accessToken: string, refreshToken: string) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  };

  const logout = () => {
    setUser(null);
    authService.logout();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
