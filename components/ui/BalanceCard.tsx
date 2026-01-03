import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from './Card';
import { useAuthStore } from '@/stores';

interface BalanceCardProps {
  onPressCharge?: () => void;
}

export function BalanceCard({ onPressCharge }: BalanceCardProps) {
  const user = useAuthStore((state) => state.user);

  const cashBalance = user?.cashBalance ?? 0;
  const pointBalance = user?.pointBalance ?? 0;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ko-KR');
  };

  return (
    <Card variant="elevated" padding="lg">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-gray-500 text-sm mb-1">내 잔액</Text>
          <Text className="text-2xl font-bold text-gray-900">
            {formatCurrency(cashBalance)}원
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-sm text-gray-500">품앗이 </Text>
            <Text className="text-sm font-semibold text-primary-600">
              {pointBalance.toFixed(1)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={onPressCharge}
          className="bg-primary-600 px-5 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">충전</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}
