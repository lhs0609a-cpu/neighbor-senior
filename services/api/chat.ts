/**
 * 채팅 관련 API
 */

import { mockDelay, mockError, generateId } from './client';
import {
  mockChatRooms,
  mockMessages,
  findUserById,
  getCurrentUser,
} from '@/mocks/data';
import type { ChatRoom, ChatMessage, User } from '@/types';

// 확장된 채팅방 타입 (상대방 정보 포함)
export interface ChatRoomWithUser extends ChatRoom {
  otherUser: User;
}

// Mock 메시지 저장소
const messagesStore: Record<string, ChatMessage[]> = { ...mockMessages };

export const chatApi = {
  /**
   * 채팅방 목록 조회
   */
  getChatRooms: async (userId: string): Promise<ChatRoomWithUser[]> => {
    console.log('[Mock API] 채팅방 목록 조회:', userId);

    const rooms = mockChatRooms
      .filter(room => room.participants.includes(userId))
      .map(room => {
        // 상대방 정보 추가
        const otherUserId = room.participants.find(id => id !== userId);
        const otherUser = otherUserId ? findUserById(otherUserId) : undefined;

        return {
          ...room,
          otherUser: otherUser || {
            id: 'unknown',
            name: '알 수 없음',
            phone: '',
            birthDate: '',
            isRequester: false,
            isProvider: false,
            address: { sido: '', sigungu: '', dong: '' },
            cashBalance: 0,
            pointBalance: 0,
            status: 'active' as const,
            createdAt: '',
          },
        };
      })
      // 최근 메시지 순 정렬
      .sort((a, b) => {
        const aTime = a.lastMessage?.createdAt || a.createdAt;
        const bTime = b.lastMessage?.createdAt || b.createdAt;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

    return mockDelay(rooms);
  },

  /**
   * 채팅방 상세 조회 (메시지 포함)
   */
  getChatRoom: async (
    roomId: string
  ): Promise<{ room: ChatRoomWithUser; messages: ChatMessage[] }> => {
    console.log('[Mock API] 채팅방 상세 조회:', roomId);

    const room = mockChatRooms.find(r => r.id === roomId);
    if (!room) {
      return mockError('채팅방을 찾을 수 없습니다');
    }

    const currentUser = getCurrentUser();
    const otherUserId = room.participants.find(id => id !== currentUser.id);
    const otherUser = otherUserId ? findUserById(otherUserId) : undefined;

    const messages = messagesStore[roomId] || [];

    return mockDelay({
      room: {
        ...room,
        otherUser: otherUser || {
          id: 'unknown',
          name: '알 수 없음',
          phone: '',
          birthDate: '',
          isRequester: false,
          isProvider: false,
          address: { sido: '', sigungu: '', dong: '' },
          cashBalance: 0,
          pointBalance: 0,
          status: 'active' as const,
          createdAt: '',
        },
      },
      messages,
    });
  },

  /**
   * 메시지 전송
   */
  sendMessage: async (
    roomId: string,
    senderId: string,
    content: string,
    type: ChatMessage['type'] = 'text'
  ): Promise<ChatMessage> => {
    console.log('[Mock API] 메시지 전송:', roomId, content);

    const newMessage: ChatMessage = {
      id: generateId('msg'),
      roomId,
      senderId,
      content,
      type,
      createdAt: new Date().toISOString(),
    };

    // 메시지 저장소에 추가
    if (!messagesStore[roomId]) {
      messagesStore[roomId] = [];
    }
    messagesStore[roomId].push(newMessage);

    // 채팅방 lastMessage 업데이트
    const room = mockChatRooms.find(r => r.id === roomId);
    if (room) {
      room.lastMessage = newMessage;
    }

    return mockDelay(newMessage, 200);
  },

  /**
   * 메시지 읽음 처리
   */
  markAsRead: async (
    roomId: string,
    userId: string
  ): Promise<{ success: boolean }> => {
    console.log('[Mock API] 메시지 읽음 처리:', roomId, userId);

    const room = mockChatRooms.find(r => r.id === roomId);
    if (room) {
      room.unreadCount = 0;
    }

    // 메시지들 readAt 업데이트
    const messages = messagesStore[roomId] || [];
    const now = new Date().toISOString();
    messages.forEach(msg => {
      if (msg.senderId !== userId && !msg.readAt) {
        msg.readAt = now;
      }
    });

    return mockDelay({ success: true });
  },

  /**
   * 채팅방 생성 (요청 수락 시 자동 생성)
   */
  createChatRoom: async (
    requestId: string,
    participants: string[]
  ): Promise<ChatRoomWithUser> => {
    console.log('[Mock API] 채팅방 생성:', requestId, participants);

    const currentUser = getCurrentUser();
    const otherUserId = participants.find(id => id !== currentUser.id);
    const otherUser = otherUserId ? findUserById(otherUserId) : undefined;

    const newRoom: ChatRoomWithUser = {
      id: generateId('chat'),
      requestId,
      participants,
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      otherUser: otherUser || {
        id: 'unknown',
        name: '알 수 없음',
        phone: '',
        birthDate: '',
        isRequester: false,
        isProvider: false,
        address: { sido: '', sigungu: '', dong: '' },
        cashBalance: 0,
        pointBalance: 0,
        status: 'active' as const,
        createdAt: '',
      },
    };

    // Mock 저장소에 추가
    mockChatRooms.push(newRoom);
    messagesStore[newRoom.id] = [];

    return mockDelay(newRoom);
  },

  /**
   * 이전 메시지 로드 (페이지네이션)
   */
  loadMoreMessages: async (
    roomId: string,
    beforeMessageId: string,
    limit: number = 20
  ): Promise<ChatMessage[]> => {
    console.log('[Mock API] 이전 메시지 로드:', roomId, beforeMessageId, limit);

    const messages = messagesStore[roomId] || [];
    const beforeIndex = messages.findIndex(m => m.id === beforeMessageId);

    if (beforeIndex <= 0) {
      return mockDelay([]);
    }

    const startIndex = Math.max(0, beforeIndex - limit);
    const olderMessages = messages.slice(startIndex, beforeIndex);

    return mockDelay(olderMessages);
  },

  /**
   * 채팅방의 요청 ID로 채팅방 찾기
   */
  getChatRoomByRequestId: async (
    requestId: string
  ): Promise<ChatRoomWithUser | null> => {
    console.log('[Mock API] 요청 ID로 채팅방 조회:', requestId);

    const room = mockChatRooms.find(r => r.requestId === requestId);
    if (!room) {
      return mockDelay(null);
    }

    const currentUser = getCurrentUser();
    const otherUserId = room.participants.find(id => id !== currentUser.id);
    const otherUser = otherUserId ? findUserById(otherUserId) : undefined;

    return mockDelay({
      ...room,
      otherUser: otherUser || {
        id: 'unknown',
        name: '알 수 없음',
        phone: '',
        birthDate: '',
        isRequester: false,
        isProvider: false,
        address: { sido: '', sigungu: '', dong: '' },
        cashBalance: 0,
        pointBalance: 0,
        status: 'active' as const,
        createdAt: '',
      },
    });
  },
};
