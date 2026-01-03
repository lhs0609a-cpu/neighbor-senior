/**
 * 서비스 요청 관련 커스텀 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuthStore, useModeStore, useRequestStore } from '@/stores';
import { requestsApi, type CreateRequestData } from '@/services/api';
import type { ServiceRequest, RequestStatus } from '@/types';

/**
 * 요청 목록 훅
 */
export const useRequests = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const mode = useModeStore((state) => state.mode);
  const { setRequests, addRequest, updateRequest } = useRequestStore();

  // 요청 목록 조회
  const requestsQuery = useQuery({
    queryKey: ['requests', mode, user?.id],
    queryFn: () => requestsApi.getRequests(mode, user?.id || ''),
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30초
    refetchInterval: 60 * 1000, // 1분마다 자동 새로고침
  });

  // 요청 생성
  const createMutation = useMutation({
    mutationFn: (data: CreateRequestData) => requestsApi.createRequest(data),
    onSuccess: (newRequest) => {
      addRequest(newRequest);
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      // 매칭 화면으로 이동
      router.push('/request/matching');
    },
    onError: (error) => {
      console.error('요청 생성 실패:', error);
    },
  });

  // 요청 취소
  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      requestsApi.cancelRequest(id, reason),
    onSuccess: (updatedRequest) => {
      updateRequest(updatedRequest.id, { status: 'cancelled' });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });

  return {
    // 상태
    requests: requestsQuery.data || [],
    isLoading: requestsQuery.isLoading,
    isRefetching: requestsQuery.isRefetching,
    error: requestsQuery.error,

    // 새로고침
    refetch: requestsQuery.refetch,

    // 요청 생성
    createRequest: createMutation.mutate,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    // 요청 취소
    cancelRequest: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
  };
};

/**
 * 요청 상세 훅
 */
export const useRequestDetail = (requestId: string) => {
  const queryClient = useQueryClient();
  const { updateRequest } = useRequestStore();

  // 요청 상세 조회
  const requestQuery = useQuery({
    queryKey: ['request', requestId],
    queryFn: () => requestsApi.getRequest(requestId),
    enabled: !!requestId,
    staleTime: 10 * 1000, // 10초
  });

  // 요청 수락 (제공자)
  const acceptMutation = useMutation({
    mutationFn: (providerId: string) =>
      requestsApi.acceptRequest(requestId, providerId),
    onSuccess: ({ request }) => {
      updateRequest(request.id, request);
      queryClient.setQueryData(['request', requestId], request);
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
  });

  // 서비스 시작 (제공자)
  const startMutation = useMutation({
    mutationFn: () => requestsApi.startService(requestId),
    onSuccess: (updatedRequest) => {
      updateRequest(requestId, updatedRequest);
      queryClient.setQueryData(['request', requestId], updatedRequest);
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });

  // 요청 완료
  const completeMutation = useMutation({
    mutationFn: () => requestsApi.completeRequest(requestId),
    onSuccess: (updatedRequest) => {
      updateRequest(requestId, updatedRequest);
      queryClient.setQueryData(['request', requestId], updatedRequest);
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });

  // 상태 업데이트
  const updateStatusMutation = useMutation({
    mutationFn: (status: RequestStatus) =>
      requestsApi.updateRequestStatus(requestId, status),
    onSuccess: (updatedRequest) => {
      updateRequest(requestId, updatedRequest);
      queryClient.setQueryData(['request', requestId], updatedRequest);
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });

  return {
    // 상태
    request: requestQuery.data,
    isLoading: requestQuery.isLoading,
    error: requestQuery.error,

    // 새로고침
    refetch: requestQuery.refetch,

    // 요청 수락
    acceptRequest: acceptMutation.mutate,
    isAccepting: acceptMutation.isPending,

    // 서비스 시작
    startService: startMutation.mutate,
    isStarting: startMutation.isPending,

    // 요청 완료
    completeRequest: completeMutation.mutate,
    isCompleting: completeMutation.isPending,

    // 상태 업데이트
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
  };
};

/**
 * 주변 요청 검색 훅 (제공자용)
 */
export const useNearbyRequests = (
  latitude: number,
  longitude: number,
  radiusKm: number = 3
) => {
  return useQuery({
    queryKey: ['nearbyRequests', latitude, longitude, radiusKm],
    queryFn: () => requestsApi.getNearbyRequests(latitude, longitude, radiusKm),
    enabled: !!latitude && !!longitude,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
};
