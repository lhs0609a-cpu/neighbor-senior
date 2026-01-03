/**
 * 인증 관련 커스텀 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores';
import { authApi } from '@/services/api';
import type { User } from '@/types';

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    isAuthenticated,
    user,
    token,
    login: storeLogin,
    logout: storeLogout,
    updateUser,
    setLoading,
  } = useAuthStore();

  // 프로필 조회
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5분
  });

  // 인증번호 발송
  const sendCodeMutation = useMutation({
    mutationFn: authApi.sendVerificationCode,
    onSuccess: () => {
      console.log('인증번호 발송 성공');
    },
    onError: (error) => {
      console.error('인증번호 발송 실패:', error);
    },
  });

  // 인증번호 확인 및 로그인
  const verifyCodeMutation = useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) =>
      authApi.verifyCode(phone, code),
    onSuccess: (data) => {
      storeLogin(data.user, data.token);
      queryClient.setQueryData(['profile'], data.user);
      router.replace('/(tabs)');
    },
    onError: (error) => {
      console.error('인증 실패:', error);
    },
  });

  // 회원가입
  const signUpMutation = useMutation({
    mutationFn: authApi.signUp,
    onSuccess: (data) => {
      storeLogin(data.user, data.token);
      queryClient.setQueryData(['profile'], data.user);
      router.replace('/(tabs)');
    },
    onError: (error) => {
      console.error('회원가입 실패:', error);
    },
  });

  // 프로필 업데이트
  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      updateUser(data);
      queryClient.setQueryData(['profile'], data);
    },
    onError: (error) => {
      console.error('프로필 업데이트 실패:', error);
    },
  });

  // 로그아웃
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      storeLogout();
      queryClient.clear();
      router.replace('/(auth)/login');
    },
  });

  // 회원탈퇴
  const withdrawMutation = useMutation({
    mutationFn: authApi.withdraw,
    onSuccess: () => {
      storeLogout();
      queryClient.clear();
      router.replace('/(auth)/login');
    },
  });

  return {
    // 상태
    isAuthenticated,
    user: profileQuery.data || user,
    token,
    isLoading: profileQuery.isLoading,

    // 인증번호
    sendVerificationCode: sendCodeMutation.mutate,
    isSendingCode: sendCodeMutation.isPending,
    sendCodeError: sendCodeMutation.error,

    // 로그인
    verifyCode: verifyCodeMutation.mutate,
    isVerifying: verifyCodeMutation.isPending,
    verifyError: verifyCodeMutation.error,

    // 회원가입
    signUp: signUpMutation.mutate,
    isSigningUp: signUpMutation.isPending,
    signUpError: signUpMutation.error,

    // 프로필
    updateProfile: updateProfileMutation.mutate,
    isUpdatingProfile: updateProfileMutation.isPending,

    // 로그아웃
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,

    // 회원탈퇴
    withdraw: withdrawMutation.mutate,
    isWithdrawing: withdrawMutation.isPending,
  };
};
