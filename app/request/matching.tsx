import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Animated, Easing, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, Card } from '@/components/ui';
import { useRequestStore } from '@/stores';
import { useChatRooms } from '@/hooks';
import { mockUsers, mockProviderProfiles } from '@/mocks/data';

type MatchingState = 'searching' | 'found' | 'confirmed';

// 제공자 데이터 동적 생성
const getRandomProvider = () => {
  // 제공자 목록에서 랜덤 선택
  const providers = mockUsers.filter((u) => u.isProvider);
  const randomProvider = providers[Math.floor(Math.random() * providers.length)];
  const profile = mockProviderProfiles.find((p) => p.userId === randomProvider?.id);

  // 나이 계산
  const birthYear = randomProvider?.birthDate
    ? parseInt(randomProvider.birthDate.split('-')[0], 10)
    : 1960;
  const age = new Date().getFullYear() - birthYear;

  // 레벨별 뱃지
  const badges: Record<number, string> = {
    1: '신규 도우미',
    2: '인증 도우미',
    3: '베테랑 도우미',
    4: '마스터 도우미',
  };

  return {
    id: randomProvider?.id || 'provider-001',
    name: randomProvider?.name || '김순자',
    age,
    rating: profile?.averageRating || 4.5,
    completions: profile?.totalCompletions || 0,
    badge: badges[profile?.level || 1],
    distance: randomProvider?.address?.dong
      ? `${randomProvider.address.dong} 거주`
      : '근처 거주',
    introduction: randomProvider?.introduction || '정성을 다해 도와드릴게요!',
    profileImage: randomProvider?.profileImageUrl || null,
  };
};

export default function MatchingScreen() {
  const router = useRouter();
  const { priceResult, requests } = useRequestStore();
  const { chatRooms, refetch: refetchChatRooms } = useChatRooms();
  const [matchingState, setMatchingState] = useState<MatchingState>('searching');
  const [searchTime, setSearchTime] = useState(0);

  // 매칭된 제공자 (한 번만 생성)
  const matchedProvider = useMemo(() => getRandomProvider(), []);

  // 최신 요청의 채팅방 찾기
  const latestRequest = requests[0];
  const chatRoom = chatRooms.find((room) => room.requestId === latestRequest?.id);

  // 애니메이션
  const pulseAnim = new Animated.Value(1);
  const rotateAnim = new Animated.Value(0);

  useEffect(() => {
    // 펄스 애니메이션
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );

    // 회전 애니메이션
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    pulse.start();
    rotate.start();

    return () => {
      pulse.stop();
      rotate.stop();
    };
  }, []);

  // 검색 시간 카운터
  useEffect(() => {
    if (matchingState === 'searching') {
      const timer = setInterval(() => {
        setSearchTime((prev) => prev + 1);
      }, 1000);

      // Mock: 3초 후 매칭 성공
      const matchTimer = setTimeout(() => {
        setMatchingState('found');
      }, 3000);

      return () => {
        clearInterval(timer);
        clearTimeout(matchTimer);
      };
    }
  }, [matchingState]);

  const handleChat = async () => {
    setMatchingState('confirmed');
    // 채팅방 목록 새로고침
    await refetchChatRooms();
    // 2초 후 채팅으로 이동
    setTimeout(() => {
      const targetRoom = chatRooms.find((room) => room.requestId === latestRequest?.id);
      if (targetRoom) {
        router.replace(`/chat/${targetRoom.id}`);
      } else {
        // 채팅방이 없으면 첫 번째 채팅방 또는 요청 상세로 이동
        router.replace(latestRequest ? `/request/${latestRequest.id}` : '/(tabs)/requests');
      }
    }, 2000);
  };

  const handleCall = () => {
    const phone = '010-1234-5678'; // Mock 전화번호
    Alert.alert(
      '전화 연결',
      `${matchedProvider.name}님께 전화할까요?`,
      [
        { text: '취소', style: 'cancel' },
        { text: '전화하기', onPress: () => Linking.openURL(`tel:${phone.replace(/-/g, '')}`) },
      ]
    );
  };

  const handleDecline = () => {
    setMatchingState('searching');
    setSearchTime(0);
  };

  const handleCancel = () => {
    router.back();
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // 검색 중 화면
  if (matchingState === 'searching') {
    return (
      <SafeAreaView className="flex-1 bg-primary-600">
        <View className="flex-1 items-center justify-center px-8">
          {/* 애니메이션 원 */}
          <View className="items-center justify-center mb-12">
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim }],
              }}
              className="w-40 h-40 rounded-full bg-white/20 items-center justify-center"
            >
              <Animated.View
                style={{
                  transform: [{ rotate: rotateInterpolate }],
                }}
                className="w-32 h-32 rounded-full bg-white/30 items-center justify-center"
              >
                <View className="w-24 h-24 rounded-full bg-white items-center justify-center">
                  <Text className="text-4xl">🔍</Text>
                </View>
              </Animated.View>
            </Animated.View>
          </View>

          <Text className="text-2xl font-bold text-white text-center mb-2">
            주변 이웃을 찾고 있어요
          </Text>
          <Text className="text-lg text-white/80 text-center mb-8">
            {Math.floor(searchTime / 60)}:{(searchTime % 60).toString().padStart(2, '0')}
          </Text>

          {priceResult && (
            <View className="bg-white/20 rounded-2xl px-6 py-4 mb-8">
              <Text className="text-white text-center">
                예상 비용: {priceResult.price.toLocaleString()}원
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleCancel}
            className="bg-white/20 px-8 py-4 rounded-full"
          >
            <Text className="text-white font-semibold">요청 취소</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 매칭 완료 화면
  if (matchingState === 'found') {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 px-5 py-6">
          {/* 성공 메시지 */}
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-3">
              <Text className="text-3xl">✅</Text>
            </View>
            <Text className="text-xl font-bold text-gray-900">
              {matchedProvider.name}님이 수락했어요!
            </Text>
          </View>

          {/* 제공자 프로필 */}
          <Card variant="elevated" padding="lg" className="mb-6">
            <View className="items-center mb-4">
              <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center mb-3">
                <Text className="text-4xl">👵</Text>
              </View>
              <Text className="text-xl font-bold text-gray-900">
                {matchedProvider.name} ({matchedProvider.age}세)
              </Text>
              <View className="flex-row items-center mt-1">
                <Text className="text-yellow-500">⭐</Text>
                <Text className="text-gray-700 ml-1">
                  {matchedProvider.rating.toFixed(1)} ({matchedProvider.completions}회)
                </Text>
              </View>
              <View className="bg-primary-100 px-3 py-1 rounded-full mt-2">
                <Text className="text-primary-700 font-medium text-sm">
                  🏅 {matchedProvider.badge}
                </Text>
              </View>
            </View>

            <View className="bg-gray-50 rounded-xl p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <Text className="text-gray-500">📍</Text>
                <Text className="text-gray-700 ml-2">{matchedProvider.distance}</Text>
              </View>
              <Text className="text-gray-600 italic">
                "{matchedProvider.introduction}"
              </Text>
            </View>

            {priceResult && (
              <View className="border-t border-gray-100 pt-4">
                <View className="flex-row justify-between">
                  <Text className="text-gray-500">결제 예정 금액</Text>
                  <Text className="text-xl font-bold text-primary-600">
                    {priceResult.price.toLocaleString()}원
                  </Text>
                </View>
              </View>
            )}
          </Card>

          {/* 액션 버튼 */}
          <View className="flex-row gap-3">
            <Button
              title="💬 채팅하기"
              variant="outline"
              className="flex-1"
              onPress={handleChat}
            />
            <Button
              title="📞 전화하기"
              className="flex-1"
              onPress={handleCall}
            />
          </View>

          {/* 취소 버튼 */}
          <TouchableOpacity
            onPress={handleDecline}
            className="mt-4 py-3"
          >
            <Text className="text-center text-gray-500">다른 분 찾기</Text>
          </TouchableOpacity>
        </View>

        {/* SOS 버튼 */}
        <View className="px-5 pb-6">
          <TouchableOpacity className="flex-row items-center justify-center py-3 bg-red-50 rounded-xl">
            <Text className="text-red-600 font-medium">⚠️ 긴급 상황 시 SOS 버튼</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 확정 후 화면
  return (
    <SafeAreaView className="flex-1 bg-green-500">
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-6">
          <Text className="text-5xl">🎉</Text>
        </View>
        <Text className="text-2xl font-bold text-white text-center mb-2">
          매칭 완료!
        </Text>
        <Text className="text-lg text-white/80 text-center">
          {matchedProvider.name}님과 연결되었어요
        </Text>
        <Text className="text-white/60 mt-4">
          채팅 화면으로 이동합니다...
        </Text>
      </View>
    </SafeAreaView>
  );
}
