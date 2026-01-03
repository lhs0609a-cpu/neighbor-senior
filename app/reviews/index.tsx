/**
 * 리뷰 관리 화면
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui';
import { mockReviews, mockUsers, mockRequests, getCurrentUser } from '@/mocks/data';
import type { Review } from '@/types';

type TabType = 'received' | 'written';

function StarRating({ rating }: { rating: number }) {
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <Text
          key={star}
          className={`text-sm ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </Text>
      ))}
    </View>
  );
}

interface ReviewWithDetails extends Review {
  reviewerName?: string;
  revieweeName?: string;
  serviceName?: string;
}

function ReviewItem({ review, isReceived }: { review: ReviewWithDetails; isReceived: boolean }) {
  const date = new Date(review.createdAt);

  return (
    <Card variant="outlined" padding="md" className="mb-3">
      <View className="flex-row items-start">
        <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center">
          <Text className="text-lg">👤</Text>
        </View>
        <View className="flex-1 ml-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-base font-medium text-gray-900">
              {isReceived ? review.reviewerName : review.revieweeName}
            </Text>
            <StarRating rating={review.rating} />
          </View>
          {review.serviceName && (
            <Text className="text-xs text-gray-500 mt-1">
              {review.serviceName}
            </Text>
          )}
          {review.content && (
            <Text className="text-sm text-gray-700 mt-2">
              {review.content}
            </Text>
          )}
          <Text className="text-xs text-gray-400 mt-2">
            {date.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>
    </Card>
  );
}

export default function ReviewsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('received');
  const currentUser = getCurrentUser();

  const {
    data: reviews = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['reviews', activeTab],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 500));

      const filtered = mockReviews.filter((review) =>
        activeTab === 'received'
          ? review.revieweeId === currentUser.id
          : review.reviewerId === currentUser.id
      );

      // 리뷰에 상세 정보 추가
      return filtered.map((review) => {
        const reviewer = mockUsers.find((u) => u.id === review.reviewerId);
        const reviewee = mockUsers.find((u) => u.id === review.revieweeId);
        const request = mockRequests.find((r) => r.id === review.requestId);

        return {
          ...review,
          reviewerName: reviewer?.name || '알 수 없음',
          revieweeName: reviewee?.name || '알 수 없음',
          serviceName: request?.title,
        } as ReviewWithDetails;
      });
    },
  });

  // 평균 평점 계산
  const averageRating = React.useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '리뷰 관리',
          headerBackTitle: '뒤로',
        }}
      />

      {/* 탭 */}
      <View className="flex-row bg-white border-b border-gray-200">
        <TouchableOpacity
          className={`flex-1 py-4 items-center border-b-2 ${
            activeTab === 'received' ? 'border-primary-600' : 'border-transparent'
          }`}
          onPress={() => setActiveTab('received')}
        >
          <Text
            className={`font-medium ${
              activeTab === 'received' ? 'text-primary-600' : 'text-gray-500'
            }`}
          >
            받은 리뷰
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-4 items-center border-b-2 ${
            activeTab === 'written' ? 'border-primary-600' : 'border-transparent'
          }`}
          onPress={() => setActiveTab('written')}
        >
          <Text
            className={`font-medium ${
              activeTab === 'written' ? 'text-primary-600' : 'text-gray-500'
            }`}
          >
            작성한 리뷰
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#4F46E5"
          />
        }
        ListHeaderComponent={
          activeTab === 'received' && reviews.length > 0 ? (
            <View className="mb-4">
              <Card variant="elevated" padding="lg">
                <View className="items-center">
                  <Text className="text-sm text-gray-500">평균 평점</Text>
                  <View className="flex-row items-center mt-2">
                    <Text className="text-3xl font-bold text-gray-900 mr-2">
                      {averageRating}
                    </Text>
                    <StarRating rating={Math.round(Number(averageRating))} />
                  </View>
                  <Text className="text-sm text-gray-500 mt-2">
                    총 {reviews.length}개의 리뷰
                  </Text>
                </View>
              </Card>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <ReviewItem review={item} isReceived={activeTab === 'received'} />
        )}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-4xl mb-4">⭐</Text>
            <Text className="text-lg font-semibold text-gray-900">
              {activeTab === 'received'
                ? '받은 리뷰가 없어요'
                : '작성한 리뷰가 없어요'}
            </Text>
            <Text className="text-gray-500 mt-2 text-center">
              {activeTab === 'received'
                ? '서비스 완료 후 리뷰를 받을 수 있어요'
                : '서비스 이용 후 리뷰를 작성해보세요'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
