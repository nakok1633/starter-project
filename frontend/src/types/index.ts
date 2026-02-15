/**
 * 프론트엔드 타입 정의
 * 백엔드 API와 동기화된 타입들
 */

/** 사용자 정보 */
export interface User {
  id: number;          // 사용자 ID
  email: string;       // 이메일
  name: string;        // 이름
  role: 'USER' | 'ADMIN';  // 역할 (USER: 일반, ADMIN: 관리자)
}

/** 인증 응답 (로그인/회원가입 시 반환) */
export interface AuthResponse {
  accessToken: string;   // JWT 액세스 토큰
  refreshToken: string;  // JWT 리프레시 토큰
  tokenType: string;     // 토큰 타입 (Bearer)
  expiresIn: number;     // 만료 시간 (초)
  user: User;            // 사용자 정보
}

/** 로그인 요청 */
export interface LoginRequest {
  email: string;
  password: string;
}

/** 회원가입 요청 */
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

/** 태스크 정보 */
export interface Task {
  id: number;                  // 태스크 ID
  title: string;               // 제목
  description: string | null;  // 설명
  status: TaskStatus;          // 상태
  priority: TaskPriority;      // 우선순위
  userId: number;              // 담당자 ID
  userName: string;            // 담당자 이름
  createdAt: string;           // 생성일
  updatedAt: string;           // 수정일
}

/** 태스크 상태 */
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

/** 태스크 우선순위 */
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

/** 태스크 생성/수정 요청 */
export interface TaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

/** 페이지네이션 응답 (제네릭) */
export interface PageResponse<T> {
  content: T[];         // 데이터 목록
  page: number;         // 현재 페이지 (0부터 시작)
  size: number;         // 페이지 크기
  totalElements: number; // 전체 항목 수
  totalPages: number;   // 전체 페이지 수
  first: boolean;       // 첫 페이지 여부
  last: boolean;        // 마지막 페이지 여부
}

/** API 오류 응답 */
export interface ErrorResponse {
  status: number;       // HTTP 상태 코드
  error: string;        // 오류 타입
  message: string;      // 오류 메시지
  path: string;         // 요청 경로
  timestamp: string;    // 발생 시간
  fieldErrors?: FieldError[];  // 필드별 오류 (유효성 검증 실패 시)
}

/** 필드 오류 (유효성 검증) */
export interface FieldError {
  field: string;        // 필드명
  message: string;      // 오류 메시지
}
