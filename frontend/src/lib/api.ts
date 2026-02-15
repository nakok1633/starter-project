/**
 * ============================================================
 * API 클라이언트 설정 (Axios)
 * ============================================================
 * 
 * 【Axios란?】
 * HTTP 요청을 보내는 라이브러리입니다.
 * 브라우저의 fetch보다 사용이 편리하고 기능이 많습니다.
 * - 자동 JSON 변환
 * - 요청/응답 가로채기 (인터셉터)
 * - 타임아웃 설정
 * - 에러 처리 편리
 * 
 * 【이 파일의 역할】
 * 1. 백엔드 API와 통신하는 Axios 인스턴스 생성
 * 2. 모든 요청에 자동으로 인증 토큰 추가 (요청 인터셉터)
 * 3. 토큰 만료 시 자동 갱신 (응답 인터셉터)
 * 
 * 【사용 방법】
 * ```
 * import { api } from '@/lib/api';
 * 
 * // GET 요청
 * const response = await api.get('/api/tasks');
 * 
 * // POST 요청
 * const response = await api.post('/api/tasks', { title: '새 태스크' });
 * ```
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthResponse } from '@/types';

/**
 * API 기본 URL 설정
 * 
 * 【process.env란?】
 * 환경 변수를 읽어오는 Node.js 객체입니다.
 * NEXT_PUBLIC_ 접두사가 붙은 변수는 브라우저에서도 접근 가능합니다.
 * .env.local 파일에서 설정하거나, 기본값(localhost:8080)을 사용합니다.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * Axios 인스턴스 생성
 * 
 * 【axios.create란?】
 * 기본 설정이 적용된 Axios 인스턴스를 만듭니다.
 * 이 인스턴스를 사용하면 매번 baseURL, headers를 설정할 필요가 없습니다.
 */
export const api = axios.create({
  baseURL: API_URL,                              // API 서버 주소
  headers: {
    'Content-Type': 'application/json',          // JSON 형식으로 데이터 전송
  },
});

/**
 * ============================================================
 * 요청 인터셉터 (Request Interceptor)
 * ============================================================
 * 
 * 【인터셉터란?】
 * 요청이 서버로 전송되기 전에 가로채서 수정하는 기능입니다.
 * 여기서는 모든 API 요청에 인증 토큰을 자동으로 추가합니다.
 * 
 * 【동작 방식】
 * api.get('/api/tasks') 호출 시:
 * 1. 인터셉터가 localStorage에서 토큰 가져옴
 * 2. 요청 헤더에 Authorization: Bearer {토큰} 추가
 * 3. 수정된 요청이 서버로 전송됨
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // localStorage에서 저장된 액세스 토큰 가져오기
    const token = localStorage.getItem('accessToken');
    
    // 토큰이 있으면 요청 헤더에 추가
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)    // 에러 발생 시 그대로 전달
);

/**
 * ============================================================
 * 응답 인터셉터 (Response Interceptor)
 * ============================================================
 * 
 * 【역할】
 * 서버 응답을 받은 후 가로채서 처리합니다.
 * 특히 401 에러(인증 실패) 시 토큰을 자동으로 갱신합니다.
 * 
 * 【토큰 갱신 흐름】
 * 1. API 요청 → 401 에러 (토큰 만료)
 * 2. 리프레시 토큰으로 새 액세스 토큰 요청
 * 3. 새 토큰 저장
 * 4. 원래 요청 재시도
 * 5. 갱신 실패 시 → 로그인 페이지로 이동
 */
api.interceptors.response.use(
  (response) => response,    // 정상 응답은 그대로 반환
  async (error: AxiosError) => {
    // 원래 요청 정보 가져오기 (_retry: 재시도 여부 플래그)
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 오류 && 첫 번째 시도인 경우에만 토큰 갱신
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;    // 재시도 플래그 설정 (무한 루프 방지)

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // 리프레시 토큰으로 새 액세스 토큰 요청
          const response = await axios.post<AuthResponse>(`${API_URL}/api/auth/refresh`, {
            refreshToken,
          });

          // 새 토큰 저장
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // 새 토큰으로 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃 처리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';    // 로그인 페이지로 강제 이동
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
