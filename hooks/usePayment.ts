/**
 * 결제 관련 커스텀 훅
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores';
import { paymentApi } from '@/services/api';

/**
 * 결제 및 잔액 관리 훅
 */
export const usePayment = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user, updateUser } = useAuthStore();

  // 잔액 조회
  const balanceQuery = useQuery({
    queryKey: ['balance', user?.id],
    queryFn: paymentApi.getBalance,
    enabled: !!user?.id,
    staleTime: 10 * 1000, // 10초
    // 초기 데이터는 스토어에서
    initialData: user
      ? { cash: user.cashBalance, point: user.pointBalance }
      : undefined,
  });

  // 잔액 충전
  const chargeMutation = useMutation({
    mutationFn: ({ amount, method }: { amount: number; method: 'card' | 'transfer' }) =>
      paymentApi.chargeBalance(amount, method),
    onSuccess: (data) => {
      // 사용자 잔액 업데이트
      updateUser({ cashBalance: data.newBalance });
      // 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });

      Alert.alert(
        '충전 완료',
        `${data.amount.toLocaleString()}원이 충전되었습니다.\n현재 잔액: ${data.newBalance.toLocaleString()}원`,
        [{ text: '확인', onPress: () => router.back() }]
      );
    },
    onError: (error: Error) => {
      Alert.alert('충전 실패', error.message || '잠시 후 다시 시도해주세요.');
    },
  });

  // 결제 실행
  const payMutation = useMutation({
    mutationFn: ({
      requestId,
      amount,
      method,
      pointAmount,
    }: {
      requestId: string;
      amount: number;
      method: 'cash' | 'point' | 'hybrid';
      pointAmount?: number;
    }) => paymentApi.processPayment(requestId, amount, method, pointAmount),
    onSuccess: (data) => {
      // 잔액 업데이트
      const newCashBalance = (user?.cashBalance || 0) - data.cashUsed;
      const newPointBalance = (user?.pointBalance || 0) - data.pointUsed;
      updateUser({
        cashBalance: newCashBalance,
        pointBalance: newPointBalance,
      });
      // 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['request', data.requestId] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
    onError: (error: Error) => {
      Alert.alert('결제 실패', error.message || '잠시 후 다시 시도해주세요.');
    },
  });

  // 환불 처리
  const refundMutation = useMutation({
    mutationFn: ({ requestId, amount }: { requestId: string; amount: number }) =>
      paymentApi.processRefund(requestId, amount),
    onSuccess: (data) => {
      updateUser({
        cashBalance: (user?.cashBalance || 0) + data.refundedAmount,
      });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });

      Alert.alert('환불 완료', `${data.refundedAmount.toLocaleString()}원이 환불되었습니다.`);
    },
  });

  return {
    // 잔액
    balance: balanceQuery.data?.cash ?? user?.cashBalance ?? 0,
    pointBalance: balanceQuery.data?.point ?? user?.pointBalance ?? 0,
    isLoadingBalance: balanceQuery.isLoading,

    // 충전
    charge: chargeMutation.mutate,
    isCharging: chargeMutation.isPending,
    chargeError: chargeMutation.error,

    // 결제
    pay: payMutation.mutate,
    isPaying: payMutation.isPending,
    payError: payMutation.error,

    // 환불
    refund: refundMutation.mutate,
    isRefunding: refundMutation.isPending,

    // 충전 페이지로 이동
    goToCharge: () => router.push('/charge'),

    // 잔액 부족 확인
    hasEnoughBalance: (amount: number) => (balanceQuery.data?.cash ?? 0) >= amount,
  };
};

/**
 * 거래 내역 훅
 */
export const useTransactions = (page: number = 1, limit: number = 20) => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['transactions', user?.id, page, limit],
    queryFn: () => paymentApi.getTransactions(user?.id || '', page, limit),
    enabled: !!user?.id,
    staleTime: 30 * 1000,
  });
};

/**
 * 출금 요청 훅 (제공자용)
 */
export const useWithdrawal = () => {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();

  const withdrawMutation = useMutation({
    mutationFn: ({
      amount,
      bankInfo,
    }: {
      amount: number;
      bankInfo: {
        bankName: string;
        accountNumber: string;
        accountHolder: string;
      };
    }) => paymentApi.requestWithdrawal(amount, bankInfo),
    onSuccess: (data) => {
      // 잔액 차감
      updateUser({
        cashBalance: (user?.cashBalance || 0) - data.amount,
      });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });

      Alert.alert(
        '출금 신청 완료',
        `${data.netAmount.toLocaleString()}원이 ${data.expectedDate.split('T')[0]}에 입금될 예정입니다.\n(수수료: ${data.fee.toLocaleString()}원)`
      );
    },
    onError: (error: Error) => {
      Alert.alert('출금 실패', error.message || '잠시 후 다시 시도해주세요.');
    },
  });

  return {
    withdraw: withdrawMutation.mutate,
    isWithdrawing: withdrawMutation.isPending,
    withdrawError: withdrawMutation.error,
  };
};

/**
 * 수익 수령 훅 (제공자용 - 서비스 완료 시)
 */
export const useEarnings = () => {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();

  const receiveMutation = useMutation({
    mutationFn: ({ requestId, amount }: { requestId: string; amount: number }) =>
      paymentApi.receiveEarnings(requestId, amount),
    onSuccess: (data) => {
      updateUser({ cashBalance: data.newBalance });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  return {
    receiveEarnings: receiveMutation.mutate,
    isReceiving: receiveMutation.isPending,
  };
};

/**
 * 제공자 통계 훅 (평점, 완료 수, 총 수익)
 */
import {
  mockProviderProfiles,
  mockEarnings,
  findProviderProfileByUserId,
} from '@/mocks/data';

export const useProviderStats = (userId?: string) => {
  const { user } = useAuthStore();
  const targetUserId = userId || user?.id;

  const statsQuery = useQuery({
    queryKey: ['providerStats', targetUserId],
    queryFn: async () => {
      // Mock delay
      await new Promise((r) => setTimeout(r, 100));

      // 제공자 프로필 조회
      const profile = findProviderProfileByUserId(targetUserId || '');

      // 수익 계산
      const earnings = mockEarnings.filter((e) => e.providerId === targetUserId);
      const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
      const availableEarnings = earnings
        .filter((e) => e.status === 'available')
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        averageRating: profile?.averageRating || 0,
        totalReviews: profile?.totalReviews || 0,
        totalCompletions: profile?.totalCompletions || 0,
        level: profile?.level || 1,
        isVerified: profile?.verificationStatus === 'approved',
        totalEarnings,
        availableEarnings,
      };
    },
    enabled: !!targetUserId,
    staleTime: 30 * 1000, // 30초
  });

  return {
    stats: statsQuery.data,
    isLoading: statsQuery.isLoading,
    refetch: statsQuery.refetch,
  };
};
