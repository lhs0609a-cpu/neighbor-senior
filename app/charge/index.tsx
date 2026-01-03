/**
 * 잔액 충전 화면
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { usePayment } from '@/hooks';
import { Button, Card } from '@/components/ui';

// 충전 금액 옵션
const CHARGE_AMOUNTS = [5000, 10000, 30000, 50000, 100000];

// 결제 수단 옵션
const PAYMENT_METHODS = [
  { id: 'card', label: '신용/체크카드', icon: '💳', description: '즉시 충전' },
  { id: 'transfer', label: '계좌이체', icon: '🏦', description: '무통장입금' },
] as const;

export default function ChargeScreen() {
  const router = useRouter();
  const { balance, charge, isCharging } = usePayment();

  const [amount, setAmount] = useState(10000);
  const [customAmount, setCustomAmount] = useState('');
  const [method, setMethod] = useState<'card' | 'transfer'>('card');

  // 충전하기
  const handleCharge = () => {
    const chargeAmount = customAmount ? parseInt(customAmount, 10) : amount;

    if (isNaN(chargeAmount) || chargeAmount < 1000) {
      Alert.alert('알림', '최소 충전 금액은 1,000원입니다.');
      return;
    }

    if (chargeAmount > 1000000) {
      Alert.alert('알림', '최대 충전 금액은 1,000,000원입니다.');
      return;
    }

    Alert.alert(
      '충전 확인',
      `${chargeAmount.toLocaleString()}원을 충전하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '충전',
          onPress: () => charge({ amount: chargeAmount, method }),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '잔액 충전',
          headerBackTitle: '뒤로',
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 현재 잔액 */}
        <Card variant="elevated" padding="lg" className="mx-4 mt-4">
          <Text className="text-gray-500 text-sm">현재 잔액</Text>
          <Text className="text-3xl font-bold text-gray-900 mt-1">
            {balance.toLocaleString()}원
          </Text>
        </Card>

        {/* 충전 금액 선택 */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            충전 금액
          </Text>

          <View className="flex-row flex-wrap gap-3">
            {CHARGE_AMOUNTS.map((value) => (
              <TouchableOpacity
                key={value}
                onPress={() => {
                  setAmount(value);
                  setCustomAmount('');
                }}
                className={`flex-1 min-w-[30%] py-4 rounded-xl border-2 items-center ${
                  amount === value && !customAmount
                    ? 'bg-primary-100 border-primary-500'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text
                  className={`font-semibold ${
                    amount === value && !customAmount
                      ? 'text-primary-700'
                      : 'text-gray-700'
                  }`}
                >
                  {value.toLocaleString()}원
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 직접 입력 */}
          <View className="mt-4">
            <Text className="text-sm text-gray-600 mb-2">직접 입력</Text>
            <View className="flex-row items-center bg-white border-2 border-gray-200 rounded-xl px-4">
              <TextInput
                className="flex-1 py-4 text-lg text-gray-900"
                placeholder="금액을 입력하세요"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                value={customAmount}
                onChangeText={(text) => {
                  // 숫자만 허용
                  const numericValue = text.replace(/[^0-9]/g, '');
                  setCustomAmount(numericValue);
                  if (numericValue) {
                    setAmount(0); // 프리셋 선택 해제
                  }
                }}
              />
              <Text className="text-lg text-gray-500">원</Text>
            </View>
            {customAmount && parseInt(customAmount, 10) < 1000 && (
              <Text className="text-red-500 text-sm mt-1">
                최소 충전 금액은 1,000원입니다
              </Text>
            )}
          </View>
        </View>

        {/* 결제 수단 선택 */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            결제 수단
          </Text>

          <View className="gap-3">
            {PAYMENT_METHODS.map((pm) => (
              <TouchableOpacity
                key={pm.id}
                onPress={() => setMethod(pm.id)}
                className={`flex-row items-center p-4 rounded-xl border-2 ${
                  method === pm.id
                    ? 'bg-primary-100 border-primary-500'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text className="text-3xl mr-4">{pm.icon}</Text>
                <View className="flex-1">
                  <Text
                    className={`font-semibold ${
                      method === pm.id ? 'text-primary-700' : 'text-gray-700'
                    }`}
                  >
                    {pm.label}
                  </Text>
                  <Text className="text-gray-500 text-sm">{pm.description}</Text>
                </View>
                {method === pm.id && (
                  <View className="w-6 h-6 bg-primary-500 rounded-full items-center justify-center">
                    <Text className="text-white text-sm">✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 충전 예정 금액 */}
        <View className="px-4 mt-6">
          <Card variant="outlined" padding="lg">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-500">충전 금액</Text>
              <Text className="text-xl font-bold text-gray-900">
                {(customAmount ? parseInt(customAmount, 10) || 0 : amount).toLocaleString()}원
              </Text>
            </View>
            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-gray-500">충전 후 잔액</Text>
              <Text className="text-primary-600 font-semibold">
                {(
                  balance + (customAmount ? parseInt(customAmount, 10) || 0 : amount)
                ).toLocaleString()}
                원
              </Text>
            </View>
          </Card>
        </View>

        {/* 안내 사항 */}
        <View className="px-4 mt-6 mb-8">
          <Text className="text-gray-400 text-xs leading-5">
            • 충전된 잔액은 서비스 이용 시 사용됩니다.{'\n'}
            • 환불은 잔액 내에서만 가능하며, 수수료가 발생할 수 있습니다.{'\n'}
            • 결제 관련 문의: 고객센터 1234-5678
          </Text>
        </View>
      </ScrollView>

      {/* 충전 버튼 */}
      <View className="p-4 bg-white border-t border-gray-200">
        <Button
          title={`${(customAmount ? parseInt(customAmount, 10) || 0 : amount).toLocaleString()}원 충전하기`}
          fullWidth
          size="lg"
          loading={isCharging}
          onPress={handleCharge}
        />
      </View>
    </SafeAreaView>
  );
}
