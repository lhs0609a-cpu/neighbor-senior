/**
 * 수익 관리 화면
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Card, Button } from '@/components/ui';
import { mockEarnings, type Earning } from '@/mocks/data';

type TabType = 'all' | 'available' | 'withdrawn';

const STATUS_CONFIG: Record<Earning['status'], { label: string; color: string; bg: string }> = {
  pending: { label: '정산 대기', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  available: { label: '출금 가능', color: 'text-green-700', bg: 'bg-green-100' },
  withdrawn: { label: '출금 완료', color: 'text-gray-600', bg: 'bg-gray-100' },
};

function EarningItem({ earning }: { earning: Earning }) {
  const config = STATUS_CONFIG[earning.status];
  const date = new Date(earning.completedAt);

  return (
    <Card variant="outlined" padding="md" className="mb-3">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-base font-medium text-gray-900">
            {earning.serviceName}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            요청자: {earning.requesterName}
          </Text>
          <Text className="text-xs text-gray-400 mt-1">
            {date.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-lg font-bold text-gray-900">
            {earning.amount.toLocaleString()}원
          </Text>
          <View className={`${config.bg} px-2 py-0.5 rounded-full mt-1`}>
            <Text className={`text-xs ${config.color}`}>{config.label}</Text>
          </View>
        </View>
      </View>
      {earning.status === 'pending' && (
        <View className="mt-3 pt-3 border-t border-gray-100">
          <Text className="text-xs text-gray-500">
            서비스 완료 후 3일 뒤 출금 가능합니다
          </Text>
        </View>
      )}
    </Card>
  );
}

function WithdrawModal({
  visible,
  availableAmount,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  availableAmount: number;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}) {
  const [amount, setAmount] = useState('');

  if (!visible) return null;

  const handleConfirm = () => {
    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('알림', '올바른 금액을 입력해주세요.');
      return;
    }
    if (numAmount > availableAmount) {
      Alert.alert('알림', '출금 가능 금액을 초과했습니다.');
      return;
    }
    onConfirm(numAmount);
  };

  return (
    <View className="absolute inset-0 bg-black/50 justify-end">
      <View className="bg-white rounded-t-3xl p-5">
        <Text className="text-lg font-bold text-gray-900 mb-4">출금 요청</Text>

        <View className="mb-4">
          <Text className="text-sm text-gray-500 mb-2">출금 가능 금액</Text>
          <Text className="text-2xl font-bold text-primary-600">
            {availableAmount.toLocaleString()}원
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-sm text-gray-500 mb-2">출금할 금액</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-lg"
            placeholder="금액을 입력하세요"
            keyboardType="number-pad"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 bg-gray-100 py-3 rounded-lg"
            onPress={() => setAmount(availableAmount.toString())}
          >
            <Text className="text-center text-gray-700 font-medium">전액</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-gray-100 py-3 rounded-lg"
            onPress={() => setAmount(Math.floor(availableAmount / 2).toString())}
          >
            <Text className="text-center text-gray-700 font-medium">절반</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-6 mb-4 p-3 bg-yellow-50 rounded-lg">
          <Text className="text-sm text-yellow-700">
            출금 수수료: 무료 (월 3회 무료, 이후 건당 500원)
          </Text>
        </View>

        <View className="flex-row gap-3">
          <Button
            title="취소"
            variant="outline"
            onPress={onClose}
            className="flex-1"
          />
          <Button
            title="출금하기"
            onPress={handleConfirm}
            className="flex-1"
          />
        </View>
      </View>
    </View>
  );
}

export default function ProviderEarningsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showWithdraw, setShowWithdraw] = useState(false);

  const {
    data: earnings = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['earnings', activeTab],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 500));
      let filtered = [...mockEarnings];
      if (activeTab !== 'all') {
        filtered = mockEarnings.filter((e) => e.status === activeTab);
      }
      return filtered.sort(
        (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );
    },
  });

  const stats = React.useMemo(() => {
    const totalEarnings = mockEarnings.reduce((sum, e) => sum + e.amount, 0);
    const availableAmount = mockEarnings
      .filter((e) => e.status === 'available')
      .reduce((sum, e) => sum + e.amount, 0);
    const pendingAmount = mockEarnings
      .filter((e) => e.status === 'pending')
      .reduce((sum, e) => sum + e.amount, 0);
    const withdrawnAmount = mockEarnings
      .filter((e) => e.status === 'withdrawn')
      .reduce((sum, e) => sum + e.amount, 0);

    return { totalEarnings, availableAmount, pendingAmount, withdrawnAmount };
  }, []);

  const handleWithdraw = (amount: number) => {
    Alert.alert(
      '출금 요청 완료',
      `${amount.toLocaleString()}원 출금을 요청했습니다.\n1-2 영업일 내 입금됩니다.`,
      [{ text: '확인' }]
    );
    setShowWithdraw(false);
  };

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
          headerTitle: '수익 관리',
          headerBackTitle: '뒤로',
        }}
      />

      <FlatList
        data={earnings}
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
          <View className="mb-4">
            {/* 수익 요약 */}
            <Card variant="elevated" padding="lg" className="mb-4">
              <View className="items-center mb-4">
                <Text className="text-sm text-gray-500">출금 가능</Text>
                <Text className="text-3xl font-bold text-primary-600 mt-1">
                  {stats.availableAmount.toLocaleString()}원
                </Text>
              </View>
              <Button
                title="출금하기"
                onPress={() => setShowWithdraw(true)}
                disabled={stats.availableAmount === 0}
                fullWidth
              />
              <View className="flex-row justify-around mt-4 pt-4 border-t border-gray-100">
                <View className="items-center">
                  <Text className="text-xs text-gray-500">정산 대기</Text>
                  <Text className="text-sm font-medium text-yellow-600 mt-1">
                    {stats.pendingAmount.toLocaleString()}원
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-xs text-gray-500">총 수익</Text>
                  <Text className="text-sm font-medium text-gray-700 mt-1">
                    {stats.totalEarnings.toLocaleString()}원
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-xs text-gray-500">출금 완료</Text>
                  <Text className="text-sm font-medium text-gray-500 mt-1">
                    {stats.withdrawnAmount.toLocaleString()}원
                  </Text>
                </View>
              </View>
            </Card>

            {/* 탭 */}
            <View className="flex-row bg-gray-100 rounded-lg p-1 mb-4">
              {(['all', 'available', 'withdrawn'] as TabType[]).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  className={`flex-1 py-2 rounded-md ${
                    activeTab === tab ? 'bg-white' : ''
                  }`}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text
                    className={`text-center text-sm ${
                      activeTab === tab
                        ? 'text-gray-900 font-medium'
                        : 'text-gray-500'
                    }`}
                  >
                    {tab === 'all' ? '전체' : tab === 'available' ? '출금 가능' : '출금 완료'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        renderItem={({ item }) => <EarningItem earning={item} />}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-4xl mb-4">💰</Text>
            <Text className="text-lg font-semibold text-gray-900">
              수익 내역이 없어요
            </Text>
            <Text className="text-gray-500 mt-2">
              서비스 제공 후 수익이 표시됩니다
            </Text>
          </View>
        }
      />

      <WithdrawModal
        visible={showWithdraw}
        availableAmount={stats.availableAmount}
        onClose={() => setShowWithdraw(false)}
        onConfirm={handleWithdraw}
      />
    </SafeAreaView>
  );
}
