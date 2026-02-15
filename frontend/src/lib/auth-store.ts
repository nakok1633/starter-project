import { create } from 'zustand';
import { User, AuthResponse, LoginRequest, SignupRequest } from '@/types';
import { api } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: () => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, isAuthenticated: true, isLoading: false });
      } catch {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  login: async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    const { accessToken, refreshToken, user } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    set({ user, isAuthenticated: true });
  },

  signup: async (data: SignupRequest) => {
    const response = await api.post<AuthResponse>('/api/auth/signup', data);
    const { accessToken, refreshToken, user } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/api/auth/logout', { refreshToken });
      }
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
    }
  },
}));
