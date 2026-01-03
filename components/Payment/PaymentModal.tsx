/**
 * 결제 모달 컴포넌트
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePayment } from '@/hooks';
import { Button, Card } from '@/components/ui';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  requestId: string;
  amount: number;
  onSuccess?: () => void;
}

type PaymentMethod = 'cash' | 'point' | 'hybrid';

export function PaymentModal({
  visible,
  onClose,
  requestId,
  amount,
  onSuccess,
}: PaymentModalProps) {
  const router = useRouter();
  const { balance, pointBalance, pay, isPaying, goToCharge } = usePayment();

  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [pointUsage, setPointUsage] = useState(0);

  // 포인트로 결제 가능한 최대 금액
  const maxPointPayment = Math.min(pointBalance * 1000, amount);

  // 현금 필요 금액
  const cashNeeded = method === 'point' ? 0 : amount - pointUsage * 1000;

  // 잔액 부족 여부
  const isBalanceInsufficient = method !== 'point' && balance < cashNeeded;

  // 결제 처리
  const handlePayment = () => {
    if (isBalanceInsufficient) {
      Alert.alert(
        '잔액 부족',
        `현재 잔액: ${balance.toLocaleString()}원\n필요 금액: ${cashNeeded.toLocaleString()}원\n\n잔액을 충전하시겠습니까?`,
        [
          { text: '취소', style: 'cancel' },
          { text: '충전하기', onPress: () => { onClose(); goToCharge(); } },
        ]
      );
      return;
    }

    pay(
      {
        requestId,
        amount,
        method,
        pointAmount: method === 'hybrid' ? pointUsage : undefined,
      },
      {
        onSuccess: () => {
          Alert.alert('결제 완료', '결제가 완료되었습니다.', [
            { text: '확인', onPress: () => { onClose(); onSuccess?.(); } },
          ]);
        },
      }
    );
  };

  // 결제 수단 옵션
  const paymentOptions: { id: PaymentMethod; label: string; description: string }[] = [
    {
      id: 'cash',
      label: '잔액 결제',
      description: `사용 가능: ${balance.toLocaleString()}원`,
    },
    {
      id: 'point',
      label: '품앗이 결제',
      description: `사용 가능: ${pointBalance}P (${maxPointPayment.toLocaleString()}원)`,
    },
    {
      id: 'hybrid',
      label: '혼합 결제',
      description: '잔액 + 품앗이 함께 사용',
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl">
          {/* 헤더 */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
            <Text className="text-lg font-semibold">결제하기</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-gray-400 text-2xl">×</Text>
            </TouchableOpacity>
          </View>

          {/* 결제 금액 */}
          <View className="p-4">
            <Card variant="elevated" padding="lg" className="bg-primary-50">
              <Text className="text-gray-500 text-center">결제 금액</Text>
              <Text className="text-3xl font-bold text-primary-600 text-center mt-1">
                {amount.toLocaleString()}원
              </Text>
            </Card>
          </View>

          {/* 결제 수단 선택 */}
          <View className="px-4">
            <Text className="text-gray-500 text-sm mb-3">결제 수단</Text>
            <View className="gap-3">
              {paymentOptions.map((option) => {
                const isDisabled =
                  (option.id === 'point' && maxPointPayment < amount) ||
                  (option.id === 'cash' && balance < amount);

                return (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => !isDisabled && setMethod(option.id)}
                    disabled={isDisabled}
                    className={`p-4 rounded-xl border-2 ${
                      method === option.id
                        ? 'bg-primary-100 border-primary-500'
                        : isDisabled
                        ? 'bg-gray-100 border-gray-200 opacity-50'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text
                          className={`font-semibold ${
                            method === option.id
                              ? 'text-primary-700'
                              : 'text-gray-700'
                          }`}
                        >
                          {option.label}
                        </Text>
                        <Text className="text-gray-500 text-sm mt-1">
                          {option.description}
                        </Text>
                      </View>
                      {method === option.id && (
                        <View className="w-6 h-6 bg-primary-500 rounded-full items-center justify-center">
                          <Text className="text-white text-sm">✓</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 혼합 결제 시 포인트 사용량 조절 */}
          {method === 'hybrid' && (
            <View className="px-4 mt-4">
              <Text className="text-gray-500 text-sm mb-2">
                품앗이 사용량: {pointUsage}P ({(pointUsage * 1000).toLocaleString()}원)
              </Text>
              <View className="flex-row gap-2">
                {[0, 1, 2, Math.floor(maxPointPayment / 1000)].map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPointUsage(p)}
                    className={`flex-1 py-2 rounded-lg items-center ${
                      pointUsage === p
                        ? 'bg-primary-500'
                        : 'bg-gray-100'
                    }`}
                  >
                    <Text
                      className={pointUsage === p ? 'text-white' : 'text-gray-700'}
                    >
                      {p}P
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* 결제 상세 */}
          <View className="px-4 mt-4">
            <Card variant="outlined" padding="md">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500">결제 금액</Text>
                <Text className="text-gray-900">{amount.toLocaleString()}원</Text>
              </View>
              {method === 'hybrid' && pointUsage > 0 && (
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-500">품앗이 사용</Text>
                  <Text className="text-green-600">
                    -{(pointUsage * 1000).toLocaleString()}원
                  </Text>
                </View>
              )}
              {method === 'point' && (
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-500">품앗이 사용</Text>
                  <Text className="text-green-600">
                    -{amount.toLocaleString()}원
                  </Text>
                </View>
              )}
              <View className="flex-row justify-between pt-2 border-t border-gray-100">
                <Text className="font-semibold">실 결제 금액</Text>
                <Text className="font-bold text-primary-600">
                  {method === 'point' ? '0' : cashNeeded.toLocaleString()}원
                </Text>
              </View>
            </Card>
          </View>

          {/* 잔액 부족 안내 */}
          {isBalanceInsufficient && (
            <View className="px-4 mt-4">
              <View className="p-3 bg-red-50 rounded-lg">
                <Text className="text-red-600 text-sm text-center">
                  잔액이 {(cashNeeded - balance).toLocaleString()}원 부족합니다
                </Text>
              </View>
            </View>
          )}

          {/* 결제 버튼 */}
          <View className="p-4 mt-4">
            <Button
              title={isPaying ? '결제 처리 중...' : '결제하기'}
              fullWidth
              size="lg"
              loading={isPaying}
              disabled={isPaying}
              onPress={handlePayment}
            />
          </View>

          {/* 안전 영역 */}
          <View className="h-8" />
        </View>
      </View>
    </Modal>
  );
}

export default PaymentModal;
