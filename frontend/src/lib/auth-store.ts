/**
 * ============================================================
 * 인증 상태 관리 (Zustand Store)
 * ============================================================
 * 
 * 【Zustand란?】
 * React에서 전역 상태를 관리하는 라이브러리입니다.
 * 여러 컴포넌트에서 동일한 데이터(예: 로그인 상태)를 공유할 때 사용합니다.
 * Redux보다 간단하고 보일러플레이트 코드가 적습니다.
 * 
 * 【이 파일의 역할】
 * - 로그인한 사용자 정보를 전역에서 접근 가능하게 관리
 * - 로그인/회원가입/로그아웃 함수 제공
 * - 페이지 새로고침 시 localStorage에서 로그인 상태 복원
 * 
 * 【사용 방법】
 * 다른 컴포넌트에서 이렇게 사용:
 * ```
 * const { user, isAuthenticated, login, logout } = useAuthStore();
 * ```
 */

import { create } from 'zustand';
import { User, AuthResponse, LoginRequest, SignupRequest } from '@/types';
import { api } from '@/lib/api';

/**
 * 인증 상태 인터페이스 (TypeScript 타입 정의)
 * 
 * 【interface란?】
 * 객체의 구조(어떤 속성과 메서드가 있는지)를 정의합니다.
 * TypeScript에서 타입 안전성을 보장하기 위해 사용합니다.
 */
interface AuthState {
  user: User | null;           // 현재 로그인한 사용자 정보 (없으면 null)
  isAuthenticated: boolean;    // 인증 여부 (true: 로그인됨, false: 비로그인)
  isLoading: boolean;          // 초기화 중인지 여부 (로딩 스피너 표시용)
  login: (data: LoginRequest) => Promise<void>;       // 로그인 함수
  signup: (data: SignupRequest) => Promise<void>;     // 회원가입 함수
  logout: () => Promise<void>;                        // 로그아웃 함수
  initialize: () => void;                             // 앱 시작 시 상태 복원 함수
}

/**
 * Zustand 스토어 생성
 * 
 * 【create 함수】
 * Zustand에서 상태 저장소를 만드는 함수입니다.
 * 반환값(useAuthStore)은 React Hook으로, 컴포넌트에서 사용 가능합니다.
 * 
 * 【set 함수】
 * 상태를 변경할 때 사용합니다. set({ user: newUser }) 형태로 호출합니다.
 * React가 자동으로 변경을 감지하고 화면을 업데이트합니다.
 */
export const useAuthStore = create<AuthState>((set) => ({
  // 초기 상태값 설정
  user: null,              // 처음에는 로그인 안 됨
  isAuthenticated: false,  // 처음에는 인증 안 됨
  isLoading: true,         // 처음에는 로딩 중 (localStorage 확인 전)

  /**
   * 초기화 함수: localStorage에서 토큰/사용자 정보 복원
   * 
   * 【언제 호출?】
   * 앱이 처음 로드될 때 (보통 layout.tsx나 각 페이지의 useEffect에서)
   * 
   * 【localStorage란?】
   * 브라우저에 데이터를 영구 저장하는 공간입니다.
   * 페이지를 새로고침하거나 브라우저를 닫아도 데이터가 유지됩니다.
   */
  initialize: () => {
    // localStorage에서 저장된 토큰과 사용자 정보 가져오기
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
