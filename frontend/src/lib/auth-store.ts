/**
 * 인증 상태 관리 (Zustand Store)
 * - 로그인/회원가입/로그아웃 처리
 * - 토큰 및 사용자 정보 localStorage 저장
 * - 인증 상태 전역 관리
 */

import { create } from 'zustand';
import { User, AuthResponse, LoginRequest, SignupRequest } from '@/types';
import { api } from '@/lib/api';

/** 인증 상태 인터페이스 */
interface AuthState {
  user: User | null;           // 현재 로그인한 사용자 정보
  isAuthenticated: boolean;    // 인증 여부
  isLoading: boolean;          // 초기화 로딩 상태
  login: (data: LoginRequest) => Promise<void>;       // 로그인
  signup: (data: SignupRequest) => Promise<void>;     // 회원가입
  logout: () => Promise<void>;                        // 로그아웃
  initialize: () => void;                             // 초기화 (localStorage에서 복원)
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  /**
   * 초기화: localStorage에서 토큰/사용자 정보 복원
   * 페이지 로드 시 호출하여 인증 상태 유지
   */
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

  /**
   * 로그인: API 호출 후 토큰 저장
   */
  login: async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    const { accessToken, refreshToken, user } = response.data;

    // 토큰 및 사용자 정보 localStorage 저장
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    set({ user, isAuthenticated: true });
  },

  /**
   * 회원가입: API 호출 후 자동 로그인
   */
  signup: async (data: SignupRequest) => {
    const response = await api.post<AuthResponse>('/api/auth/signup', data);
    const { accessToken, refreshToken, user } = response.data;

    // 토큰 및 사용자 정보 localStorage 저장
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    set({ user, isAuthenticated: true });
  },

  /**
   * 로그아웃: 서버 세션 종료 및 localStorage 정리
   */
  logout: async () => {
    try {
      // 서버에 로그아웃 요청 (리프레시 토큰 삭제)
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/api/auth/logout', { refreshToken });
      }
    } catch {
      // 로그아웃 오류는 무시 (클라이언트 정리는 계속 진행)
    } finally {
      // localStorage 정리 및 상태 초기화
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
    }
  },
}));
