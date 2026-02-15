/**
 * API 클라이언트 설정
 * Axios 인스턴스 생성 및 인터셉터 설정
 * - 요청 인터셉터: 액세스 토큰 자동 추가
 * - 응답 인터셉터: 401 오류 시 토큰 자동 갱신
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthResponse } from '@/types';

// API 기본 URL (환경변수 또는 기본값)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Axios 인스턴스 생성
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 요청 인터셉터
 * 모든 API 요청에 액세스 토큰을 Authorization 헤더에 추가
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 응답 인터셉터
 * 401 오류 발생 시 리프레시 토큰으로 액세스 토큰 자동 갱신
 * 갱신 실패 시 로그인 페이지로 리다이렉트
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 오류 및 재시도가 아닌 경우에만 토큰 갱신 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post<AuthResponse>(`${API_URL}/api/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃 처리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
