import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useModeStore } from '@/stores';
import { useRequests } from '@/hooks';
import { Card, Button } from '@/components/ui';
import { CATEGORY_NAMES, CATEGORY_ICONS } from '@/constants/prices';
import type { ServiceRequest } from '@/types';

// 요청 상태 한글화
const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  pending: { text: '대기중', color: 'bg-yellow-100 text-yellow-800' },
  matching: { text: '매칭중', color: 'bg-blue-100 text-blue-800' },
  matched: { text: '매칭완료', color: 'bg-green-100 text-green-800' },
  in_progress: { text: '진행중', color: 'bg-purple-100 text-purple-800' },
  completed: { text: '완료', color: 'bg-gray-100 text-gray-800' },
  cancelled: { text: '취소됨', color: 'bg-red-100 text-red-800' },
};

function RequestCard({ request, onPress }: { request: ServiceRequest; onPress: () => void }) {
  const status = STATUS_LABELS[request.status] || STATUS_LABELS.pending;
  const icon = CATEGORY_ICONS[request.category] || '📌';
  const categoryName = CATEGORY_NAMES[request.category] || request.category;

  return (
    <Card variant="outlined" padding="md" onPress={onPress}>
      <View className="flex-row justify-between items-start">
        <View className="flex-row items-center gap-3 flex-1">
          <View className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center">
            <Text className="text-2xl">{icon}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
              {request.title || categoryName}
            </Text>
            <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>
              {request.description}
            </Text>
          </View>
        </View>
        <View className={`px-2 py-1 rounded-full ${status.color.split(' ')[0]}`}>
          <Text className={`text-xs font-medium ${status.color.split(' ')[1]}`}>
            {status.text}
          </Text>
        </View>
      </View>
      <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100">
        <Text className="text-sm text-gray-500">
          {new Date(request.createdAt).toLocaleDateString('ko-KR')}
        </Text>
        <Text className="text-base font-bold text-primary-600">
          {request.pricing.finalPrice.toLocaleString()}원
        </Text>
      </View>
    </Card>
  );
}

export default function RequestsScreen() {
  const router = useRouter();
  const mode = useModeStore((state) => state.mode);
  const { requests, isLoading, isRefetching, refetch, error } = useRequests();
  const isProvider = mode === 'provider';

  // 로딩 상태
  if (isLoading && requests.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-gray-500">요청 목록을 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="px-5 py-4 bg-white border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900">
          {isProvider ? '요청 목록' : '내 요청'}
        </Text>
      </View>

      {requests.length === 0 ? (
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-4xl mb-4">📋</Text>
          <Text className="text-lg font-semibold text-gray-900 text-center">
            {isProvider ? '아직 요청이 없어요' : '아직 요청한 내역이 없어요'}
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            {isProvider
              ? '활동을 시작하면 주변 요청을 볼 수 있어요'
              : '홈에서 도움을 요청해보세요'}
          </Text>
          {!isProvider && (
            <Button
              title="요청하기"
              className="mt-6"
              onPress={() => router.push('/request/create')}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, gap: 12 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#4F46E5"
            />
          }
          renderItem={({ item }) => (
            <RequestCard
              request={item}
              onPress={() => router.push(`/request/${item.id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
