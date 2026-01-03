/**
 * 요청 상세 페이지
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useRequestDetail, useChatRoomByRequestId, usePayment, useRequests, useProviderStats } from '@/hooks';
import { useModeStore, useAuthStore } from '@/stores';
import { Button, Card } from '@/components/ui';
import { CATEGORY_NAMES, CATEGORY_ICONS } from '@/constants/prices';
import type { RequestStatus } from '@/types';

// 상태별 뱃지 색상
const STATUS_STYLES: Record<RequestStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '대기중' },
  matching: { bg: 'bg-blue-100', text: 'text-blue-800', label: '매칭중' },
  matched: { bg: 'bg-green-100', text: 'text-green-800', label: '매칭완료' },
  in_progress: { bg: 'bg-purple-100', text: 'text-purple-800', label: '진행중' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: '완료' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: '취소됨' },
  disputed: { bg: 'bg-orange-100', text: 'text-orange-800', label: '분쟁중' },
};

// 상태 뱃지 컴포넌트
function StatusBadge({ status }: { status: RequestStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <View className={`px-3 py-1 rounded-full ${style.bg}`}>
      <Text className={`text-sm font-medium ${style.text}`}>{style.label}</Text>
    </View>
  );
}

// 정보 행 컴포넌트
function InfoRow({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
      <Text className="text-gray-500">{icon} {label}</Text>
      <Text className="text-gray-900 font-medium">{value}</Text>
    </View>
  );
}

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const mode = useModeStore((state) => state.mode);
  const user = useAuthStore((state) => state.user);
  const [showPayment, setShowPayment] = useState(false);

  const {
    request,
    isLoading,
    error,
    acceptRequest,
    isAccepting,
    startService,
    isStarting,
    completeRequest,
    isCompleting,
  } = useRequestDetail(id);

  const { data: chatRoom } = useChatRoomByRequestId(id);
  const { pay, isPaying, balance, goToCharge } = usePayment();
  const { cancelRequest, isCancelling } = useRequests();
  const { stats: providerStats } = useProviderStats(request?.providerId);

  // 로딩 상태
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-gray-500">요청 정보를 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  // 에러 상태
  if (error || !request) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center p-5">
        <Text className="text-6xl mb-4">😢</Text>
        <Text className="text-xl font-semibold text-gray-900 mb-2">
          요청을 찾을 수 없습니다
        </Text>
        <Text className="text-gray-500 text-center mb-6">
          요청이 삭제되었거나 접근 권한이 없습니다.
        </Text>
        <Button title="돌아가기" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const isRequester = mode === 'requester';
  const isProvider = mode === 'provider';
  const isMyRequest = request.requesterId === user?.id;

  // 채팅하기
  const handleChat = () => {
    if (chatRoom) {
      router.push(`/chat/${chatRoom.id}`);
    } else {
      Alert.alert('알림', '채팅방이 아직 생성되지 않았습니다.');
    }
  };

  // 전화하기
  const handleCall = () => {
    const phone = request.provider?.phone || '010-0000-0000';
    Alert.alert('전화 연결', `${request.provider?.name || '제공자'}님께 전화할까요?`, [
      { text: '취소', style: 'cancel' },
      { text: '전화하기', onPress: () => Linking.openURL(`tel:${phone.replace(/-/g, '')}`) },
    ]);
  };

  // 요청 수락 (제공자)
  const handleAccept = () => {
    Alert.alert('요청 수락', '이 요청을 수락하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '수락',
        onPress: () => acceptRequest(user?.id || ''),
      },
    ]);
  };

  // 서비스 시작 (제공자)
  const handleStart = () => {
    Alert.alert('서비스 시작', '서비스를 시작하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '시작', onPress: () => startService() },
    ]);
  };

  // 서비스 완료 (제공자)
  const handleComplete = () => {
    Alert.alert('서비스 완료', '서비스를 완료 처리하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '완료', onPress: () => completeRequest() },
    ]);
  };

  // 결제하기
  const handlePayment = () => {
    const amount = request.pricing.finalPrice;

    if (balance < amount) {
      Alert.alert(
        '잔액 부족',
        `결제 금액: ${amount.toLocaleString()}원\n현재 잔액: ${balance.toLocaleString()}원\n\n잔액을 충전하시겠습니까?`,
        [
          { text: '취소', style: 'cancel' },
          { text: '충전하기', onPress: goToCharge },
        ]
      );
      return;
    }

    Alert.alert(
      '결제 확인',
      `${amount.toLocaleString()}원을 결제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '결제',
          onPress: () => {
            pay(
              { requestId: id, amount, method: 'cash' },
              {
                onSuccess: () => {
                  Alert.alert('결제 완료', '결제가 완료되었습니다.');
                },
              }
            );
          },
        },
      ]
    );
  };

  // 요청 취소
  const handleCancel = () => {
    Alert.alert('요청 취소', '정말 이 요청을 취소하시겠습니까?', [
      { text: '아니오', style: 'cancel' },
      {
        text: '취소하기',
        style: 'destructive',
        onPress: () => {
          cancelRequest(
            { id: id, reason: '사용자 취소' },
            {
              onSuccess: () => {
                Alert.alert('취소 완료', '요청이 취소되었습니다.', [
                  { text: '확인', onPress: () => router.back() },
                ]);
              },
              onError: () => {
                Alert.alert('오류', '요청 취소에 실패했습니다.');
              },
            }
          );
        },
      },
    ]);
  };

  // 날짜 포맷
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '요청 상세',
          headerBackTitle: '뒤로',
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 요청 정보 카드 */}
        <Card variant="elevated" padding="lg" className="mx-4 mt-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-row items-center flex-1">
              <Text className="text-4xl mr-3">
                {CATEGORY_ICONS[request.category] || '📋'}
              </Text>
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900">
                  {request.title || CATEGORY_NAMES[request.category]}
                </Text>
                <Text className="text-gray-500 mt-1">
                  {request.subcategory?.replace(/_/g, ' ')}
                </Text>
              </View>
            </View>
            <StatusBadge status={request.status} />
          </View>

          <View className="mt-4 p-4 bg-gray-50 rounded-xl">
            <Text className="text-gray-700 text-base leading-6">
              {request.description}
            </Text>
          </View>
        </Card>

        {/* 위치 정보 */}
        <Card variant="outlined" padding="lg" className="mx-4 mt-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">📍 위치 정보</Text>

          <View className="bg-gray-100 rounded-xl p-4 mb-3">
            <Text className="text-gray-500 text-sm mb-1">출발지</Text>
            <Text className="text-gray-900">{request.location.address}</Text>
          </View>

          {request.destination && (
            <View className="bg-gray-100 rounded-xl p-4">
              <Text className="text-gray-500 text-sm mb-1">목적지</Text>
              <Text className="text-gray-900">{request.destination.address}</Text>
            </View>
          )}

          {request.distanceMeters && (
            <Text className="text-gray-500 text-sm mt-3 text-center">
              거리: {(request.distanceMeters / 1000).toFixed(1)}km
            </Text>
          )}
        </Card>

        {/* 일정 정보 */}
        <Card variant="outlined" padding="lg" className="mx-4 mt-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">📅 일정</Text>
          <InfoRow
            label="요청 유형"
            value={request.requestType === 'immediate' ? '즉시 요청' : '예약 요청'}
            icon="⏰"
          />
          {request.scheduledAt && (
            <InfoRow
              label="예정 시간"
              value={formatDate(request.scheduledAt)}
              icon="📆"
            />
          )}
          <InfoRow
            label="요청 시간"
            value={formatDate(request.createdAt)}
            icon="🕐"
          />
          {request.matchedAt && (
            <InfoRow
              label="매칭 시간"
              value={formatDate(request.matchedAt)}
              icon="🤝"
            />
          )}
          {request.completedAt && (
            <InfoRow
              label="완료 시간"
              value={formatDate(request.completedAt)}
              icon="✅"
            />
          )}
        </Card>

        {/* 가격 정보 */}
        <Card variant="elevated" padding="lg" className="mx-4 mt-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">💰 결제 정보</Text>

          <View className="bg-primary-50 rounded-xl p-4 items-center mb-4">
            <Text className="text-gray-500 text-sm">총 금액</Text>
            <Text className="text-3xl font-bold text-primary-600 mt-1">
              {request.pricing.finalPrice.toLocaleString()}원
            </Text>
          </View>

          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-500">기본료</Text>
              <Text className="text-gray-900">
                {request.pricing.basePrice.toLocaleString()}원
              </Text>
            </View>
            {request.pricing.distanceFee > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-gray-500">거리비</Text>
                <Text className="text-gray-900">
                  +{request.pricing.distanceFee.toLocaleString()}원
                </Text>
              </View>
            )}
            {request.pricing.demandMultiplier !== 1 && (
              <View className="flex-row justify-between">
                <Text className="text-gray-500">수요 조정</Text>
                <Text className="text-gray-900">
                  x{request.pricing.demandMultiplier}
                </Text>
              </View>
            )}
            {request.pricing.specialAdjustments.map((adj, idx) => (
              <View key={idx} className="flex-row justify-between">
                <Text className="text-gray-500">{adj.type}</Text>
                <Text className="text-gray-900">x{adj.multiplier}</Text>
              </View>
            ))}
          </View>

          <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <Text className="text-gray-500">결제 상태</Text>
            <Text
              className={`font-medium ${
                request.paymentStatus === 'paid'
                  ? 'text-green-600'
                  : request.paymentStatus === 'refunded'
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }`}
            >
              {request.paymentStatus === 'paid'
                ? '결제완료'
                : request.paymentStatus === 'refunded'
                ? '환불됨'
                : '미결제'}
            </Text>
          </View>
        </Card>

        {/* 제공자 정보 (매칭 후) */}
        {request.provider && (
          <Card variant="outlined" padding="lg" className="mx-4 mt-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">👤 제공자</Text>
            <View className="flex-row items-center">
              <View className="w-16 h-16 bg-senior-warm rounded-full items-center justify-center">
                <Text className="text-2xl">👵</Text>
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-lg font-semibold text-gray-900">
                  {request.provider.name}
                </Text>
                <Text className="text-gray-500">
                  {request.provider.address?.dong || '역삼동'}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Text className="text-yellow-500">⭐</Text>
                  <Text className="text-gray-700 ml-1">
                    {providerStats?.averageRating.toFixed(1) || '-'}
                  </Text>
                  <Text className="text-gray-400 ml-2">
                    ({providerStats?.totalCompletions || 0}회 완료)
                  </Text>
                </View>
              </View>
            </View>
            {request.provider.introduction && (
              <View className="mt-3 p-3 bg-gray-50 rounded-xl">
                <Text className="text-gray-600 text-sm">
                  "{request.provider.introduction}"
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* 액션 버튼 영역 */}
        <View className="p-4 mt-4 gap-3">
          {/* 요청자 액션 */}
          {isRequester && isMyRequest && (
            <>
              {request.status === 'matched' && (
                <>
                  <View className="flex-row gap-3">
                    <Button
                      title="💬 채팅하기"
                      variant="outline"
                      className="flex-1"
                      onPress={handleChat}
                    />
                    <Button
                      title="📞 전화하기"
                      variant="outline"
                      className="flex-1"
                      onPress={handleCall}
                    />
                  </View>
                  {request.paymentStatus === 'pending' && (
                    <Button
                      title="결제하기"
                      variant="senior"
                      size="lg"
                      fullWidth
                      loading={isPaying}
                      onPress={handlePayment}
                    />
                  )}
                </>
              )}
              {request.status === 'in_progress' && (
                <Button
                  title="💬 채팅하기"
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={handleChat}
                />
              )}
              {(request.status === 'pending' || request.status === 'matching') && (
                <Button
                  title="요청 취소"
                  variant="outline"
                  fullWidth
                  onPress={handleCancel}
                />
              )}
              {request.status === 'completed' && request.paymentStatus !== 'paid' && (
                <Button
                  title="결제하기"
                  variant="senior"
                  size="lg"
                  fullWidth
                  loading={isPaying}
                  onPress={handlePayment}
                />
              )}
            </>
          )}

          {/* 제공자 액션 */}
          {isProvider && (
            <>
              {(request.status === 'pending' || request.status === 'matching') && (
                <Button
                  title="요청 수락하기"
                  variant="senior"
                  size="senior"
                  fullWidth
                  loading={isAccepting}
                  onPress={handleAccept}
                />
              )}
              {request.status === 'matched' && (
                <>
                  <Button
                    title="💬 채팅하기"
                    variant="outline"
                    size="lg"
                    fullWidth
                    onPress={handleChat}
                  />
                  <Button
                    title="서비스 시작"
                    variant="senior"
                    size="senior"
                    fullWidth
                    loading={isStarting}
                    onPress={handleStart}
                  />
                </>
              )}
              {request.status === 'in_progress' && (
                <>
                  <Button
                    title="💬 채팅하기"
                    variant="outline"
                    size="lg"
                    fullWidth
                    onPress={handleChat}
                  />
                  <Button
                    title="서비스 완료"
                    variant="senior"
                    size="senior"
                    fullWidth
                    loading={isCompleting}
                    onPress={handleComplete}
                  />
                </>
              )}
            </>
          )}
        </View>

        {/* 하단 여백 */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
