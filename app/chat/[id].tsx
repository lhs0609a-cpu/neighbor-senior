/**
 * 채팅 상세 페이지
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useChatRoom } from '@/hooks';
import { useAuthStore } from '@/stores';
import type { ChatMessage } from '@/types';

// 시간 포맷 함수
function formatTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// 날짜 구분 확인
function isSameDay(date1: string, date2: string) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// 날짜 포맷
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(dateString, today.toISOString())) {
    return '오늘';
  } else if (isSameDay(dateString, yesterday.toISOString())) {
    return '어제';
  } else {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  }
}

// 메시지 버블 컴포넌트
function MessageBubble({
  message,
  isOwn,
  showTime = true,
}: {
  message: ChatMessage;
  isOwn: boolean;
  showTime?: boolean;
}) {
  // 위치 메시지 처리
  if (message.type === 'location') {
    try {
      const location = JSON.parse(message.content);
      return (
        <View className={`max-w-[75%] mb-2 ${isOwn ? 'self-end' : 'self-start'}`}>
          <TouchableOpacity
            className={`px-4 py-3 rounded-2xl ${
              isOwn ? 'bg-primary-600 rounded-br-none' : 'bg-gray-200 rounded-bl-none'
            }`}
          >
            <Text className={isOwn ? 'text-white' : 'text-gray-900'}>
              📍 위치 공유
            </Text>
            <Text
              className={`text-sm mt-1 ${
                isOwn ? 'text-primary-100' : 'text-gray-500'
              }`}
            >
              {location.address}
            </Text>
          </TouchableOpacity>
          {showTime && (
            <Text
              className={`text-xs text-gray-400 mt-1 ${
                isOwn ? 'text-right' : 'text-left'
              }`}
            >
              {formatTime(message.createdAt)}
            </Text>
          )}
        </View>
      );
    } catch {
      // JSON 파싱 실패 시 일반 메시지로 처리
    }
  }

  return (
    <View className={`max-w-[75%] mb-2 ${isOwn ? 'self-end' : 'self-start'}`}>
      <View
        className={`px-4 py-3 rounded-2xl ${
          isOwn
            ? 'bg-primary-600 rounded-br-none'
            : 'bg-gray-200 rounded-bl-none'
        }`}
      >
        <Text
          className={`text-base ${isOwn ? 'text-white' : 'text-gray-900'}`}
        >
          {message.content}
        </Text>
      </View>
      {showTime && (
        <View className={`flex-row items-center mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          {isOwn && message.readAt && (
            <Text className="text-xs text-primary-400 mr-1">읽음</Text>
          )}
          <Text className="text-xs text-gray-400">
            {formatTime(message.createdAt)}
          </Text>
        </View>
      )}
    </View>
  );
}

// 날짜 구분선 컴포넌트
function DateDivider({ date }: { date: string }) {
  return (
    <View className="flex-row items-center my-4">
      <View className="flex-1 h-px bg-gray-200" />
      <Text className="mx-4 text-xs text-gray-400">{formatDate(date)}</Text>
      <View className="flex-1 h-px bg-gray-200" />
    </View>
  );
}

// 타이핑 표시 컴포넌트
function TypingIndicator() {
  return (
    <View className="self-start max-w-[75%] mb-2">
      <View className="px-4 py-3 rounded-2xl bg-gray-200 rounded-bl-none flex-row items-center">
        <View className="flex-row space-x-1">
          <View className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          <View className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <View className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </View>
        <Text className="text-gray-500 ml-2 text-sm">입력 중...</Text>
      </View>
    </View>
  );
}

// 퀵 액션 컴포넌트
function QuickActions({
  onLocationPress,
  onRequestPress,
}: {
  onLocationPress: () => void;
  onRequestPress: () => void;
}) {
  return (
    <View className="flex-row gap-2 px-4 py-2 border-t border-gray-100 bg-white">
      <TouchableOpacity
        onPress={onLocationPress}
        className="px-4 py-2 bg-gray-100 rounded-full flex-row items-center"
      >
        <Text>📍</Text>
        <Text className="ml-1 text-gray-700">위치</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onRequestPress}
        className="px-4 py-2 bg-primary-100 rounded-full flex-row items-center"
      >
        <Text>📋</Text>
        <Text className="ml-1 text-primary-700">요청 보기</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const [inputText, setInputText] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(true);

  const {
    room,
    messages,
    isLoading,
    error,
    isTyping,
    sendMessage,
    sendLocationMessage,
    isSending,
  } = useChatRoom(id);

  // 새 메시지 시 스크롤
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  // 키보드 표시 시 퀵 액션 숨김
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setShowQuickActions(false);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setShowQuickActions(true);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // 메시지 전송
  const handleSend = () => {
    const trimmed = inputText.trim();
    if (trimmed && !isSending) {
      sendMessage(trimmed);
      setInputText('');
    }
  };

  // 위치 공유
  const handleLocationShare = () => {
    // Mock 위치 전송
    sendLocationMessage(37.5000, 127.0367, '서울시 강남구 역삼동');
  };

  // 요청 보기
  const handleViewRequest = () => {
    if (room?.requestId) {
      router.push(`/request/${room.requestId}`);
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  // 에러 상태
  if (error || !room) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center p-5">
        <Text className="text-6xl mb-4">😢</Text>
        <Text className="text-xl font-semibold text-gray-900">
          채팅방을 찾을 수 없습니다
        </Text>
      </SafeAreaView>
    );
  }

  // 메시지 렌더링 (날짜 구분선 포함)
  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isOwn = item.senderId === user?.id;
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showDateDivider =
      !prevMessage || !isSameDay(prevMessage.createdAt, item.createdAt);

    return (
      <>
        {showDateDivider && <DateDivider date={item.createdAt} />}
        <MessageBubble message={item} isOwn={isOwn} />
      </>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      {/* 헤더 */}
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: room.otherUser?.name || '채팅',
          headerBackTitle: '뒤로',
          headerRight: () => (
            <TouchableOpacity
              onPress={handleViewRequest}
              className="mr-2"
            >
              <Text className="text-primary-600">요청 보기</Text>
            </TouchableOpacity>
          ),
        }}
      />

      {/* 채팅 상대 정보 */}
      <View className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-senior-warm rounded-full items-center justify-center">
            <Text>👵</Text>
          </View>
          <View className="ml-3">
            <Text className="font-semibold text-gray-900">
              {room.otherUser?.name}
            </Text>
            <Text className="text-sm text-gray-500">
              {room.otherUser?.address?.dong || '역삼동'} • 응답률 98%
            </Text>
          </View>
        </View>
      </View>

      {/* 메시지 목록 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-400">
              대화를 시작해보세요!
            </Text>
          </View>
        }
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
      />

      {/* 퀵 액션 */}
      {showQuickActions && (
        <QuickActions
          onLocationPress={handleLocationShare}
          onRequestPress={handleViewRequest}
        />
      )}

      {/* 입력창 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View className="flex-row items-end p-3 border-t border-gray-200 bg-white">
          <TextInput
            ref={inputRef}
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-base max-h-24"
            placeholder="메시지를 입력하세요..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
            className={`ml-2 w-11 h-11 rounded-full items-center justify-center ${
              inputText.trim() ? 'bg-primary-600' : 'bg-gray-300'
            }`}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white text-xl">↑</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
