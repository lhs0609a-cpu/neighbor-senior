/**
 * Mock API 클라이언트
 * 실제 백엔드 연동 시 이 파일만 수정하면 됨
 */

// API 응답 지연 시간 (실제 네트워크 시뮬레이션)
const API_DELAY = 500;

/**
 * Mock 지연 함수 - 성공 응답
 */
export const mockDelay = <T>(data: T, delay: number = API_DELAY): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), delay));

/**
 * Mock 지연 함수 - 에러 응답
 */
export const mockError = (message: string, delay: number = API_DELAY): Promise<never> =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(message)), delay));

/**
 * 랜덤 성공/실패 (테스트용)
 */
export const mockMaybeError = <T>(
  data: T,
  errorMessage: string,
  errorRate: number = 0.1
): Promise<T> => {
  if (Math.random() < errorRate) {
    return mockError(errorMessage);
  }
  return mockDelay(data);
};

/**
 * ID 생성 함수
 */
export const generateId = (prefix: string = 'id'): string =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * API 응답 타입
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 페이지네이션 응답 타입
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// 실제 API URL (나중에 사용)
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.neighbor-senior.com';

/**
 * 실제 API 클라이언트 (나중에 구현)
 */
// export const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });
