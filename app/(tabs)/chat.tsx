import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useChatRooms } from '@/hooks';
import type { ChatRoomWithUser } from '@/services/api';

function ChatRoomItem({
  room,
  onPress,
}: {
  room: ChatRoomWithUser;
  onPress: () => void;
}) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return '방금';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center p-4 bg-white border-b border-gray-100"
    >
      {/* 프로필 이미지 */}
      <View className="w-14 h-14 bg-senior-warm rounded-full items-center justify-center">
        <Text className="text-xl">👵</Text>
      </View>

      {/* 채팅 정보 */}
      <View className="flex-1 ml-3">
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-semibold text-gray-900">
            {room.otherUser?.name || '알 수 없음'}
          </Text>
          <Text className="text-xs text-gray-500">
            {room.lastMessage && formatTime(room.lastMessage.createdAt)}
          </Text>
        </View>
        <View className="flex-row justify-between items-center mt-1">
          <Text className="text-sm text-gray-500 flex-1" numberOfLines={1}>
            {room.lastMessage?.content || '대화를 시작하세요'}
          </Text>
          {room.unreadCount > 0 && (
            <View className="bg-primary-600 rounded-full min-w-[20px] h-5 items-center justify-center px-1.5 ml-2">
              <Text className="text-xs text-white font-bold">
                {room.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const router = useRouter();
  const { chatRooms, isLoading, refetch, totalUnreadCount } = useChatRooms();

  // 로딩 상태
  if (isLoading && chatRooms.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-gray-500">채팅 목록을 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="px-5 py-4 bg-white border-b border-gray-200 flex-row justify-between items-center">
        <Text className="text-xl font-bold text-gray-900">채팅</Text>
        {totalUnreadCount > 0 && (
          <View className="bg-primary-600 rounded-full px-2 py-1">
            <Text className="text-xs text-white font-bold">
              {totalUnreadCount}개 읽지 않음
            </Text>
          </View>
        )}
      </View>

      {chatRooms.length === 0 ? (
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-4xl mb-4">💬</Text>
          <Text className="text-lg font-semibold text-gray-900 text-center">
            아직 대화가 없어요
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            서비스가 매칭되면 채팅이 시작됩니다
          </Text>
        </View>
      ) : (
        <FlatList
          data={chatRooms}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor="#4F46E5"
            />
          }
          renderItem={({ item }) => (
            <ChatRoomItem
              room={item}
              onPress={() => router.push(`/chat/${item.id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
