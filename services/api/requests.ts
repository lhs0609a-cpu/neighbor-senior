/**
 * 서비스 요청 관련 API
 */

import { mockDelay, mockError, generateId } from './client';
import {
  mockRequests,
  mockUsers,
  mockChatRooms,
  getCurrentUser,
  findUserById,
} from '@/mocks/data';
import type { ServiceRequest, RequestStatus, ChatRoom } from '@/types';

// Mock 데이터 저장소 (메모리)
let requestsStore = [...mockRequests];

export interface CreateRequestData {
  category: ServiceRequest['category'];
  subcategory?: string;
  title?: string;
  description: string;
  urgency: ServiceRequest['urgency'];
  requestType: ServiceRequest['requestType'];
  scheduledAt?: string;
  location: ServiceRequest['location'];
  destination?: ServiceRequest['destination'];
  pricing: ServiceRequest['pricing'];
}

export const requestsApi = {
  /**
   * 요청 목록 조회
   * @param role - requester: 내 요청 목록, provider: 주변 요청 목록
   */
  getRequests: async (
    role: 'requester' | 'provider',
    userId: string
  ): Promise<ServiceRequest[]> => {
    console.log('[Mock API] 요청 목록 조회:', role, userId);

    let filtered: ServiceRequest[];

    if (role === 'requester') {
      // 요청자: 내가 생성한 요청들
      filtered = requestsStore.filter(r => r.requesterId === userId);
    } else {
      // 제공자: 매칭 중인 요청들 (내가 수락 가능한)
      filtered = requestsStore.filter(
        r => r.status === 'matching' || r.status === 'pending'
      );
    }

    // 최신순 정렬
    filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return mockDelay(filtered);
  },

  /**
   * 요청 상세 조회
   */
  getRequest: async (id: string): Promise<ServiceRequest> => {
    console.log('[Mock API] 요청 상세 조회:', id);

    const request = requestsStore.find(r => r.id === id);
    if (!request) {
      return mockError('요청을 찾을 수 없습니다');
    }

    // 제공자 정보 추가
    if (request.providerId) {
      request.provider = findUserById(request.providerId);
    }

    return mockDelay(request);
  },

  /**
   * 새 요청 생성
   */
  createRequest: async (data: CreateRequestData): Promise<ServiceRequest> => {
    console.log('[Mock API] 요청 생성:', data);

    const currentUser = getCurrentUser();
    const newRequest: ServiceRequest = {
      id: generateId('req'),
      requesterId: currentUser.id,
      category: data.category,
      subcategory: data.subcategory,
      title: data.title,
      description: data.description,
      urgency: data.urgency,
      requestType: data.requestType,
      scheduledAt: data.scheduledAt,
      location: data.location,
      destination: data.destination,
      pricing: data.pricing,
      status: 'matching',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
    };

    requestsStore.unshift(newRequest);
    return mockDelay(newRequest, 800);
  },

  /**
   * 요청 상태 업데이트
   */
  updateRequestStatus: async (
    id: string,
    status: RequestStatus
  ): Promise<ServiceRequest> => {
    console.log('[Mock API] 요청 상태 업데이트:', id, status);

    const request = requestsStore.find(r => r.id === id);
    if (!request) {
      return mockError('요청을 찾을 수 없습니다');
    }

    request.status = status;

    // 상태에 따른 타임스탬프 업데이트
    const now = new Date().toISOString();
    switch (status) {
      case 'in_progress':
        request.startedAt = now;
        break;
      case 'completed':
        request.completedAt = now;
        break;
      case 'cancelled':
        request.cancelledAt = now;
        break;
    }

    return mockDelay(request);
  },

  /**
   * 제공자가 요청 수락
   */
  acceptRequest: async (
    requestId: string,
    providerId: string
  ): Promise<{ request: ServiceRequest; chatRoom: ChatRoom }> => {
    console.log('[Mock API] 요청 수락:', requestId, providerId);

    const request = requestsStore.find(r => r.id === requestId);
    if (!request) {
      return mockError('요청을 찾을 수 없습니다');
    }

    if (request.status !== 'matching' && request.status !== 'pending') {
      return mockError('이미 매칭된 요청입니다');
    }

    // 요청 상태 업데이트
    request.status = 'matched';
    request.providerId = providerId;
    request.provider = findUserById(providerId);
    request.matchedAt = new Date().toISOString();

    // 채팅방 생성
    const newChatRoom: ChatRoom = {
      id: generateId('chat'),
      requestId: request.id,
      participants: [request.requesterId, providerId],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
    };

    return mockDelay({ request, chatRoom: newChatRoom }, 1000);
  },

  /**
   * 요청 취소
   */
  cancelRequest: async (
    id: string,
    reason?: string
  ): Promise<ServiceRequest> => {
    console.log('[Mock API] 요청 취소:', id, reason);

    const request = requestsStore.find(r => r.id === id);
    if (!request) {
      return mockError('요청을 찾을 수 없습니다');
    }

    if (request.status === 'completed') {
      return mockError('이미 완료된 요청은 취소할 수 없습니다');
    }

    request.status = 'cancelled';
    request.cancelledAt = new Date().toISOString();

    return mockDelay(request);
  },

  /**
   * 요청 완료 처리
   */
  completeRequest: async (id: string): Promise<ServiceRequest> => {
    console.log('[Mock API] 요청 완료:', id);

    const request = requestsStore.find(r => r.id === id);
    if (!request) {
      return mockError('요청을 찾을 수 없습니다');
    }

    request.status = 'completed';
    request.completedAt = new Date().toISOString();

    return mockDelay(request);
  },

  /**
   * 서비스 시작 (제공자가 서비스 시작)
   */
  startService: async (id: string): Promise<ServiceRequest> => {
    console.log('[Mock API] 서비스 시작:', id);

    const request = requestsStore.find(r => r.id === id);
    if (!request) {
      return mockError('요청을 찾을 수 없습니다');
    }

    if (request.status !== 'matched') {
      return mockError('매칭 완료된 요청만 시작할 수 있습니다');
    }

    request.status = 'in_progress';
    request.startedAt = new Date().toISOString();

    return mockDelay(request);
  },

  /**
   * 주변 요청 검색 (제공자용)
   */
  getNearbyRequests: async (
    latitude: number,
    longitude: number,
    radiusKm: number
  ): Promise<ServiceRequest[]> => {
    console.log('[Mock API] 주변 요청 검색:', latitude, longitude, radiusKm);

    // Mock: 매칭 중인 모든 요청 반환
    const nearbyRequests = requestsStore.filter(
      r => r.status === 'matching' || r.status === 'pending'
    );

    return mockDelay(nearbyRequests);
  },
};
