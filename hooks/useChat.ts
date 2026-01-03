/**
 * 채팅 관련 커스텀 훅
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores';
import { chatApi, type ChatRoomWithUser } from '@/services/api';
import type { ChatMessage } from '@/types';

/**
 * 채팅방 목록 훅
 */
export const useChatRooms = () => {
  const user = useAuthStore((state) => state.user);

  const chatRoomsQuery = useQuery({
    queryKey: ['chatRooms', user?.id],
    queryFn: () => chatApi.getChatRooms(user?.id || ''),
    enabled: !!user?.id,
    staleTime: 10 * 1000, // 10초
    refetchInterval: 30 * 1000, // 30초마다 자동 새로고침
  });

  // 총 읽지 않은 메시지 수
  const totalUnreadCount = (chatRoomsQuery.data || []).reduce(
    (sum, room) => sum + room.unreadCount,
    0
  );

  return {
    chatRooms: chatRoomsQuery.data || [],
    isLoading: chatRoomsQuery.isLoading,
    error: chatRoomsQuery.error,
    refetch: chatRoomsQuery.refetch,
    totalUnreadCount,
  };
};

/**
 * 채팅방 상세 훅 (메시지 포함)
 */
export const useChatRoom = (roomId: string) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 채팅방 및 메시지 조회
  const chatQuery = useQuery({
    queryKey: ['chat', roomId],
    queryFn: () => chatApi.getChatRoom(roomId),
    enabled: !!roomId,
    staleTime: 5 * 1000,
  });

  // 메시지 동기화
  useEffect(() => {
    if (chatQuery.data?.messages) {
      setLocalMessages(chatQuery.data.messages);
    }
  }, [chatQuery.data?.messages]);

  // 읽음 처리
  useEffect(() => {
    if (roomId && user?.id) {
      chatApi.markAsRead(roomId, user.id);
      // 채팅방 목록의 unreadCount 갱신
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    }
  }, [roomId, user?.id, queryClient]);

  // 메시지 전송
  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      chatApi.sendMessage(roomId, user?.id || '', content),
    onMutate: async (content) => {
      // 낙관적 업데이트: 즉시 로컬에 추가
      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        roomId,
        senderId: user?.id || '',
        content,
        type: 'text',
        createdAt: new Date().toISOString(),
      };
      setLocalMessages((prev) => [...prev, optimisticMessage]);
      return { optimisticMessage };
    },
    onSuccess: (newMessage, _, context) => {
      // 임시 메시지를 실제 메시지로 교체
      setLocalMessages((prev) =>
        prev.map((msg) =>
          msg.id === context?.optimisticMessage.id ? newMessage : msg
        )
      );
      // 채팅방 목록 갱신
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
    onError: (_, __, context) => {
      // 실패 시 임시 메시지 제거
      if (context?.optimisticMessage) {
        setLocalMessages((prev) =>
          prev.filter((msg) => msg.id !== context.optimisticMessage.id)
        );
      }
    },
  });

  // Mock 상대방 응답 시뮬레이션
  const simulateResponse = useCallback(() => {
    const responses = [
      '네, 알겠습니다!',
      '좋아요, 그렇게 하죠 😊',
      '곧 도착할게요~',
      '감사합니다!',
      '잠시만요, 확인해볼게요.',
      '네, 문제없어요!',
    ];

    // 타이핑 표시
    setIsTyping(true);

    const typingDuration = 1000 + Math.random() * 2000;

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const mockMessage: ChatMessage = {
        id: `mock-${Date.now()}`,
        roomId,
        senderId: chatQuery.data?.room.otherUser.id || 'provider-001',
        content: randomResponse,
        type: 'text',
        createdAt: new Date().toISOString(),
      };

      setLocalMessages((prev) => [...prev, mockMessage]);
    }, typingDuration);
  }, [roomId, chatQuery.data?.room.otherUser.id]);

  // 메시지 전송 래퍼 (응답 시뮬레이션 포함)
  const sendMessage = useCallback(
    (content: string) => {
      sendMutation.mutate(content);

      // 50% 확률로 상대방 응답 시뮬레이션
      if (Math.random() > 0.5) {
        simulateResponse();
      }
    },
    [sendMutation, simulateResponse]
  );

  // 위치 메시지 전송
  const sendLocationMessage = useCallback(
    (latitude: number, longitude: number, address: string) => {
      const content = JSON.stringify({ latitude, longitude, address });
      chatApi.sendMessage(roomId, user?.id || '', content, 'location').then(
        (newMessage) => {
          setLocalMessages((prev) => [...prev, newMessage]);
        }
      );
    },
    [roomId, user?.id]
  );

  // 정리
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    // 채팅방 정보
    room: chatQuery.data?.room,
    messages: localMessages,
    isLoading: chatQuery.isLoading,
    error: chatQuery.error,

    // 상대방 타이핑 표시
    isTyping,

    // 메시지 전송
    sendMessage,
    sendLocationMessage,
    isSending: sendMutation.isPending,

    // 새로고침
    refetch: chatQuery.refetch,
  };
};

/**
 * 요청 ID로 채팅방 찾기
 */
export const useChatRoomByRequestId = (requestId: string) => {
  return useQuery({
    queryKey: ['chatRoom', 'byRequest', requestId],
    queryFn: () => chatApi.getChatRoomByRequestId(requestId),
    enabled: !!requestId,
  });
};
