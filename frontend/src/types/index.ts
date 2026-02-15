/**
 * ============================================================
 * 프론트엔드 타입 정의
 * ============================================================
 * 
 * 【TypeScript 타입이란?】
 * 변수, 함수 매개변수, 반환값 등의 데이터 형태를 정의합니다.
 * JavaScript는 타입이 없어서 런타임에 에러가 발생하지만,
 * TypeScript는 개발 중에 에러를 잡아줍니다.
 * 
 * 【왜 타입을 정의?】
 * - 자동완성 지원: user. 입력 시 name, email 등 제안
 * - 오타 방지: user.emial 같은 오타 즉시 감지
 * - API 응답 구조 문서화: 백엔드와 프론트엔드 계약
 * 
 * 【interface vs type】
 * - interface: 객체 형태 정의, 확장 가능 (extends)
 * - type: 모든 타입 정의 가능, 유니온 타입 등
 * 둘 다 비슷하게 사용 가능하며, 프로젝트 컨벤션에 따름
 * 
 * 【이 파일은 어디서 사용?】
 * 프로젝트 전체에서 import해서 사용합니다:
 * import { User, Task, AuthResponse } from '@/types';
 */

/**
 * 사용자 정보 타입
 * 
 * 【리터럴 타입】
 * role: 'USER' | 'ADMIN'
 * 'USER' 또는 'ADMIN' 문자열만 허용합니다.
 * 일반 string보다 엄격하게 타입을 제한합니다.
 */
export interface User {
  id: number;          // 사용자 고유 ID (데이터베이스 PK)
  email: string;       // 이메일 (로그인 ID로 사용)
  name: string;        // 사용자 이름
  role: 'USER' | 'ADMIN';  // 역할 (USER: 일반, ADMIN: 관리자)
}

/**
 * 인증 응답 타입
 * 로그인/회원가입 API가 반환하는 데이터 구조입니다.
 */
export interface AuthResponse {
  accessToken: string;   // JWT 액세스 토큰 (API 요청 시 사용, 짧은 수명)
  refreshToken: string;  // JWT 리프레시 토큰 (액세스 토큰 갱신용, 긴 수명)
  tokenType: string;     // 토큰 타입 (항상 "Bearer")
  expiresIn: number;     // 액세스 토큰 만료 시간 (초 단위)
  user: User;            // 로그인한 사용자 정보
}

/** 로그인 요청 타입 */
export interface LoginRequest {
  email: string;
  password: string;
}

/** 회원가입 요청 타입 */
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

/**
 * 태스크 정보 타입
 * 
 * 【Optional 타입】
 * description: string | null
 * string 또는 null 값을 가질 수 있습니다.
 * 백엔드에서 null을 반환할 수 있는 필드입니다.
 */
export interface Task {
  id: number;                  // 태스크 고유 ID
  title: string;               // 제목 (필수)
  description: string | null;  // 설명 (선택, 없으면 null)
  status: TaskStatus;          // 상태 (아래 정의된 4가지 중 하나)
  priority: TaskPriority;      // 우선순위 (아래 정의된 4가지 중 하나)
  userId: number;              // 담당자 ID
  userName: string;            // 담당자 이름
  createdAt: string;           // 생성일 (ISO 8601 형식 문자열)
  updatedAt: string;           // 수정일 (ISO 8601 형식 문자열)
}

/**
 * 태스크 상태 타입
 * 
 * 【Union 타입 (유니온)】
 * type TaskStatus = 'A' | 'B' | 'C'
 * A, B, C 중 하나의 값만 가질 수 있습니다.
 * 백엔드의 enum과 동일하게 맞춰야 합니다.
 */
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
// PENDING: 대기, IN_PROGRESS: 진행중, COMPLETED: 완료, CANCELLED: 취소

/** 태스크 우선순위 타입 */
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
// LOW: 낮음, MEDIUM: 보통, HIGH: 높음, URGENT: 긴급

/**
 * 태스크 생성/수정 요청 타입
 * 
 * 【Optional Property (?:)】
 * status?: TaskStatus
 * 이 필드는 있어도 되고 없어도 됩니다.
 * 생성 시에는 기본값을 사용하므로 선택적입니다.
 */
export interface TaskRequest {
  title: string;              // 제목 (필수)
  description?: string;       // 설명 (선택)
  status?: TaskStatus;        // 상태 (선택, 기본값: PENDING)
  priority?: TaskPriority;    // 우선순위 (선택, 기본값: MEDIUM)
}

/**
 * 페이지네이션 응답 타입 (제네릭)
 * 
 * 【제네릭 <T>】
 * PageResponse<Task>: content가 Task[] 타입
 * PageResponse<User>: content가 User[] 타입
 * 
 * 하나의 타입 정의로 여러 데이터 타입에 재사용할 수 있습니다.
 * 백엔드의 Page<T> 응답과 매핑됩니다.
 */
export interface PageResponse<T> {
  content: T[];         // 현재 페이지의 데이터 목록
  page: number;         // 현재 페이지 번호 (0부터 시작)
  size: number;         // 페이지당 항목 수
  totalElements: number; // 전체 항목 수 (모든 페이지 합계)
  totalPages: number;   // 전체 페이지 수
  first: boolean;       // 첫 페이지 여부 (page === 0)
  last: boolean;        // 마지막 페이지 여부 (page === totalPages - 1)
}

/**
 * API 오류 응답 타입
 * 백엔드에서 에러 발생 시 반환하는 형식입니다.
 */
export interface ErrorResponse {
  status: number;       // HTTP 상태 코드 (400, 401, 404, 500 등)
  error: string;        // 오류 타입 ("Bad Request", "Unauthorized" 등)
  message: string;      // 사용자에게 표시할 오류 메시지
  path: string;         // 요청한 API 경로
  timestamp: string;    // 오류 발생 시간
  fieldErrors?: FieldError[];  // 유효성 검증 실패 시 필드별 오류 목록
}

/**
 * 필드별 유효성 검증 오류
 * 폼 제출 시 백엔드 검증 실패 시 반환됩니다.
 */
export interface FieldError {
  field: string;        // 오류가 발생한 필드명 (예: "email")
  message: string;      // 오류 메시지 (예: "이메일 형식이 올바르지 않습니다")
}
  field: string;        // 필드명
  message: string;      // 오류 메시지
}
