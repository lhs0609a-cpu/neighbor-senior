/**
 * 결제 내역 화면
 */

import React from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui';
import { mockTransactions, type Transaction } from '@/mocks/data';

// 거래 타입별 아이콘과 색상
const TRANSACTION_CONFIG: Record<
  Transaction['type'],
  { icon: string; label: string; color: string }
> = {
  charge: { icon: '💰', label: '충전', color: 'text-green-600' },
  payment: { icon: '💳', label: '결제', color: 'text-red-600' },
  receive: { icon: '📥', label: '수익', color: 'text-blue-600' },
  withdraw: { icon: '🏦', label: '출금', color: 'text-gray-600' },
};

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const config = TRANSACTION_CONFIG[transaction.type];
  const isPositive = transaction.amount > 0;
  const date = new Date(transaction.createdAt);

  return (
    <Card variant="outlined" padding="md" className="mb-3">
      <View className="flex-row items-center">
        <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center">
          <Text className="text-xl">{config.icon}</Text>
        </View>
        <View className="flex-1 ml-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-base font-medium text-gray-900">
              {transaction.description}
            </Text>
            <Text
              className={`text-base font-bold ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isPositive ? '+' : ''}
              {transaction.amount.toLocaleString()}원
            </Text>
          </View>
          <View className="flex-row justify-between items-center mt-1">
            <View className="flex-row items-center">
              <View className={`px-2 py-0.5 rounded-full bg-gray-100`}>
                <Text className={`text-xs ${config.color}`}>{config.label}</Text>
              </View>
            </View>
            <Text className="text-sm text-gray-500">
              {date.toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
      </View>
      <View className="mt-3 pt-3 border-t border-gray-100 flex-row justify-between">
        <Text className="text-sm text-gray-500">잔액</Text>
        <Text className="text-sm font-medium text-gray-700">
          {transaction.balance.toLocaleString()}원
        </Text>
      </View>
    </Card>
  );
}

export default function PaymentHistoryScreen() {
  const {
    data: transactions = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 500));
      return mockTransactions.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
  });

  // 통계 계산
  const stats = React.useMemo(() => {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyTransactions = transactions.filter(
      (t) => new Date(t.createdAt) >= thisMonth
    );

    const totalCharge = monthlyTransactions
      .filter((t) => t.type === 'charge')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalPayment = monthlyTransactions
      .filter((t) => t.type === 'payment')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { totalCharge, totalPayment };
  }, [transactions]);

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
          headerTitle: '결제 내역',
          headerBackTitle: '뒤로',
        }}
      />

      <FlatList
        data={transactions}
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
            <Card variant="elevated" padding="lg">
              <Text className="text-sm text-gray-500 mb-3">이번 달 요약</Text>
              <View className="flex-row justify-around">
                <View className="items-center">
                  <Text className="text-sm text-gray-500">충전</Text>
                  <Text className="text-lg font-bold text-green-600 mt-1">
                    +{stats.totalCharge.toLocaleString()}원
                  </Text>
                </View>
                <View className="w-px bg-gray-200" />
                <View className="items-center">
                  <Text className="text-sm text-gray-500">결제</Text>
                  <Text className="text-lg font-bold text-red-600 mt-1">
                    -{stats.totalPayment.toLocaleString()}원
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        }
        renderItem={({ item }) => <TransactionItem transaction={item} />}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-4xl mb-4">💳</Text>
            <Text className="text-lg font-semibold text-gray-900">
              결제 내역이 없어요
            </Text>
            <Text className="text-gray-500 mt-2">
              서비스 이용 후 결제 내역이 표시됩니다
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
