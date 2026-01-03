/**
 * 인증 관련 API
 */

import { mockDelay, mockError, generateId } from './client';
import { mockUsers, getCurrentUser } from '@/mocks/data';
import type { User } from '@/types';

export interface LoginResponse {
  token: string;
  user: User;
}

export interface VerificationResponse {
  success: boolean;
  message?: string;
}

export const authApi = {
  /**
   * 인증번호 발송
   * Mock: 항상 성공
   */
  sendVerificationCode: async (phone: string): Promise<VerificationResponse> => {
    console.log('[Mock API] 인증번호 발송:', phone);
    return mockDelay({ success: true });
  },

  /**
   * 인증번호 확인
   * Mock: 아무 코드나 입력하면 성공 (개발 모드)
   */
  verifyCode: async (phone: string, code: string): Promise<LoginResponse> => {
    console.log('[Mock API] 인증번호 확인:', phone, code);

    // 개발 모드: 모든 코드 허용
    const user = getCurrentUser();
    return mockDelay({
      token: `mock-jwt-token-${Date.now()}`,
      user: { ...user, phone },
    });
  },

  /**
   * 현재 사용자 프로필 조회
   */
  getProfile: async (): Promise<User> => {
    console.log('[Mock API] 프로필 조회');
    return mockDelay(getCurrentUser());
  },

  /**
   * 프로필 업데이트
   */
  updateProfile: async (data: Partial<User>): Promise<User> => {
    console.log('[Mock API] 프로필 업데이트:', data);
    const currentUser = getCurrentUser();
    const updatedUser = { ...currentUser, ...data };
    // 실제로는 mockUsers 배열도 업데이트해야 하지만 Mock이므로 생략
    return mockDelay(updatedUser);
  },

  /**
   * 로그아웃
   */
  logout: async (): Promise<{ success: boolean }> => {
    console.log('[Mock API] 로그아웃');
    return mockDelay({ success: true });
  },

  /**
   * 회원가입
   */
  signUp: async (data: {
    phone: string;
    name: string;
    birthDate: string;
    gender: 'male' | 'female';
    address: User['address'];
  }): Promise<LoginResponse> => {
    console.log('[Mock API] 회원가입:', data);

    const newUser: User = {
      id: generateId('user'),
      phone: data.phone,
      name: data.name,
      birthDate: data.birthDate,
      gender: data.gender,
      isRequester: true,
      isProvider: false,
      address: data.address,
      cashBalance: 0,
      pointBalance: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    return mockDelay({
      token: `mock-jwt-token-${Date.now()}`,
      user: newUser,
    });
  },

  /**
   * 회원 탈퇴
   */
  withdraw: async (): Promise<{ success: boolean }> => {
    console.log('[Mock API] 회원 탈퇴');
    return mockDelay({ success: true }, 1000);
  },

  /**
   * 토큰 갱신
   */
  refreshToken: async (refreshToken: string): Promise<{ token: string }> => {
    console.log('[Mock API] 토큰 갱신');
    return mockDelay({ token: `mock-jwt-token-${Date.now()}` });
  },
};
