import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useModeStore, useAuthStore, useRequestStore } from '@/stores';
import { ModeSwitch, BalanceCard, CategoryGrid, Card, Button } from '@/components/ui';
import type { ServiceCategory } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const mode = useModeStore((state) => state.mode);
  const { isProviderActive, toggleProviderActive } = useModeStore();
  const user = useAuthStore((state) => state.user);
  const { draft, updateDraft } = useRequestStore();

  const isRequester = mode === 'requester';

  const handleCategorySelect = (category: ServiceCategory) => {
    updateDraft({ category });
    router.push('/request/create');
  };

  const handleQuickRequest = () => {
    if (draft.description.trim()) {
      router.push('/request/create');
    }
  };

  // 요청자 홈 화면
  if (isRequester) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* 헤더 */}
          <View className="px-5 pt-4 pb-2">
            <Text className="text-2xl font-bold text-gray-900">
              안녕하세요 👋
            </Text>
            <Text className="text-gray-500 mt-1">
              {user?.address?.dong || '우리 동네'}에서 도움을 받아보세요
            </Text>
          </View>

          {/* 모드 스위치 */}
          <View className="px-5 py-3">
            <ModeSwitch size="lg" />
          </View>

          {/* 잔액 카드 */}
          <View className="px-5 py-2">
            <BalanceCard onPressCharge={() => router.push('/charge')} />
          </View>

          {/* 빠른 요청 입력 */}
          <View className="px-5 py-4">
            <Card variant="outlined" padding="md">
              <Text className="text-gray-700 font-medium mb-3">
                무엇을 도와드릴까요?
              </Text>
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-900 min-h-[100px]"
                placeholder="예: 내일 아침 8시에 아이 어린이집 데려다줄 분 찾아요"
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                value={draft.description}
                onChangeText={(text) => updateDraft({ description: text })}
              />
              <View className="flex-row justify-end mt-3 gap-2">
                <TouchableOpacity className="p-2">
                  <Text className="text-xl">🎤</Text>
                </TouchableOpacity>
                <Button
                  title="AI 분석"
                  size="sm"
                  disabled={!draft.description.trim()}
                  onPress={handleQuickRequest}
                />
              </View>
            </Card>
          </View>

          {/* 카테고리 */}
          <View className="px-5 py-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              카테고리별 요청
            </Text>
            <CategoryGrid
              selectedCategory={draft.category}
              onSelectCategory={handleCategorySelect}
            />
          </View>

          {/* 동네 소식 (플레이스홀더) */}
          <View className="px-5 py-4 mb-8">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              🏠 우리 동네 소식
            </Text>
            <Card variant="outlined" padding="md">
              <View className="gap-3">
                <View className="flex-row items-center gap-2">
                  <Text className="text-gray-500">•</Text>
                  <Text className="text-gray-700 flex-1">
                    김순자님이 반찬 나눔을 올렸어요
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-gray-500">•</Text>
                  <Text className="text-gray-700 flex-1">
                    이민수님이 스마트폰 교육을 제안했어요
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-gray-500">•</Text>
                  <Text className="text-gray-700 flex-1">
                    새 이웃 박영희님이 가입했어요
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 제공자 홈 화면 (시니어 친화)
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-senior-xl font-bold text-gray-900">
            안녕하세요 👋
          </Text>
          <Text className="text-senior text-gray-500 mt-1">
            오늘도 이웃을 도와주세요
          </Text>
        </View>

        {/* 모드 스위치 */}
        <View className="px-5 py-3">
          <ModeSwitch size="lg" />
        </View>

        {/* 활동 ON/OFF */}
        <View className="px-5 py-4">
          <Card variant="elevated" padding="lg">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-senior-lg font-bold text-gray-900">
                  활동 상태
                </Text>
                <Text className="text-senior text-gray-500 mt-1">
                  {isProviderActive ? '요청을 받을 수 있어요' : '요청을 받지 않아요'}
                </Text>
              </View>
              <Button
                title={isProviderActive ? '활동 중' : '활동 시작'}
                variant={isProviderActive ? 'senior' : 'secondary'}
                size="senior"
                onPress={toggleProviderActive}
              />
            </View>
          </Card>
        </View>

        {/* 오늘 수익 */}
        <View className="px-5 py-4">
          <Card variant="outlined" padding="lg">
            <Text className="text-senior text-gray-500 mb-2">오늘 수익</Text>
            <Text className="text-senior-xl font-bold text-gray-900">
              0원
            </Text>
            <TouchableOpacity className="mt-3">
              <Text className="text-senior text-primary-600 font-semibold">
                수익 현황 보기 →
              </Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* 새 요청 알림 */}
        <View className="px-5 py-4 mb-8">
          <Text className="text-senior-lg font-bold text-gray-900 mb-4">
            🔔 새 요청
          </Text>
          {isProviderActive ? (
            <Card variant="outlined" padding="lg">
              <Text className="text-senior text-center text-gray-500">
                새로운 요청을 기다리고 있어요
              </Text>
            </Card>
          ) : (
            <Card variant="outlined" padding="lg">
              <Text className="text-senior text-center text-gray-500">
                활동을 시작하면 요청을 받을 수 있어요
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
