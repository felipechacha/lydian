export interface ApiResponse<T> {
  data: T;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest extends LoginRequest {
  fullName: string;
}

export interface AuthMessageResponse {
  message: string;
}

export interface SignupResponse {
  id: string;
  email: string;
  fullName: string;
}

export interface SessionUserResponse {
  id: string;
  email: string;
  role: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  requestId?: string;
}
