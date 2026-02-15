export interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  userId: number;
  userName: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  fieldErrors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}
