import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore, useModeStore } from '@/stores';
import { useAuth, usePayment, useProviderStats } from '@/hooks';
import { Card, Button } from '@/components/ui';

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  badge?: string;
}

function MenuItem({ icon, title, subtitle, onPress, showArrow = true, badge }: MenuItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-4 px-4 bg-white"
    >
      <Text className="text-2xl mr-4">{icon}</Text>
      <View className="flex-1">
        <Text className="text-base text-gray-900">{title}</Text>
        {subtitle && (
          <Text className="text-sm text-gray-500 mt-0.5">{subtitle}</Text>
        )}
      </View>
      {badge && (
        <View className="bg-primary-100 px-2 py-0.5 rounded-full mr-2">
          <Text className="text-xs text-primary-700">{badge}</Text>
        </View>
      )}
      {showArrow && (
        <Text className="text-gray-400">›</Text>
      )}
    </TouchableOpacity>
  );
}

function Divider() {
  return <View className="h-px bg-gray-100 ml-14" />;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isLoggingOut } = useAuth();
  const { balance, pointBalance, goToCharge } = usePayment();
  const { stats: providerStats } = useProviderStats();
  const mode = useModeStore((state) => state.mode);
  const isProvider = mode === 'provider';

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 프로필 헤더 */}
        <View className="bg-white px-5 py-6">
          <View className="flex-row items-center">
            <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center">
              <Text className="text-3xl">👤</Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold text-gray-900">
                {user?.name || '사용자'}
              </Text>
              <Text className="text-gray-500 mt-1">
                {user?.address?.dong || '위치 설정 필요'}
              </Text>
              {isProvider && providerStats && (
                <View className="flex-row items-center mt-2">
                  <View className="bg-green-100 px-2 py-0.5 rounded-full">
                    <Text className="text-xs text-green-700 font-medium">
                      {providerStats.isVerified ? '인증 제공자' : '신규 제공자'}
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-500 ml-2">
                    ⭐ {providerStats.averageRating.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              className="p-2"
              onPress={() => router.push('/profile/edit')}
            >
              <Text className="text-primary-600 font-semibold">편집</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 잔액 정보 */}
        <View className="px-5 py-4">
          <Card variant="elevated" padding="md">
            <View className="flex-row justify-around">
              <TouchableOpacity
                className="items-center flex-1"
                onPress={goToCharge}
              >
                <Text className="text-sm text-gray-500">잔액</Text>
                <Text className="text-lg font-bold text-gray-900 mt-1">
                  {balance.toLocaleString()}원
                </Text>
                <Text className="text-xs text-primary-600 mt-1">충전하기</Text>
              </TouchableOpacity>
              <View className="w-px bg-gray-200" />
              <View className="items-center flex-1">
                <Text className="text-sm text-gray-500">품앗이</Text>
                <Text className="text-lg font-bold text-primary-600 mt-1">
                  {pointBalance}P
                </Text>
              </View>
              {isProvider && providerStats && (
                <>
                  <View className="w-px bg-gray-200" />
                  <View className="items-center flex-1">
                    <Text className="text-sm text-gray-500">총 수익</Text>
                    <Text className="text-lg font-bold text-gray-900 mt-1">
                      {providerStats.totalEarnings.toLocaleString()}원
                    </Text>
                  </View>
                </>
              )}
            </View>
          </Card>
        </View>

        {/* 내 활동 메뉴 */}
        <View className="mt-4">
          <Text className="text-sm text-gray-500 px-5 py-2">내 활동</Text>
          <View className="bg-white">
            <MenuItem
              icon="📋"
              title="이용 내역"
              subtitle="요청 및 제공 기록"
              onPress={() => router.push('/(tabs)/requests')}
            />
            <Divider />
            <MenuItem
              icon="💳"
              title="결제 내역"
              subtitle="충전 및 결제 기록"
              onPress={() => router.push('/payment/history')}
            />
            <Divider />
            <MenuItem
              icon="⭐"
              title="리뷰 관리"
              subtitle="받은 리뷰 및 작성한 리뷰"
              onPress={() => router.push('/reviews')}
            />
          </View>
        </View>

        {/* 제공자 설정 메뉴 */}
        {isProvider && (
          <View className="mt-4">
            <Text className="text-sm text-gray-500 px-5 py-2">제공자 설정</Text>
            <View className="bg-white">
              <MenuItem
                icon="🔧"
                title="제공 서비스 설정"
                subtitle="제공할 수 있는 서비스 선택"
                onPress={() => router.push('/provider/services')}
              />
              <Divider />
              <MenuItem
                icon="⏰"
                title="활동 시간 설정"
                subtitle="요청을 받을 시간대 설정"
                onPress={() => router.push('/provider/schedule')}
              />
              <Divider />
              <MenuItem
                icon="💰"
                title="수익 관리"
                subtitle="출금 및 정산 내역"
                onPress={() => router.push('/provider/earnings')}
              />
            </View>
          </View>
        )}

        {/* 설정 메뉴 */}
        <View className="mt-4">
          <Text className="text-sm text-gray-500 px-5 py-2">설정</Text>
          <View className="bg-white">
            <MenuItem
              icon="🔔"
              title="알림 설정"
              onPress={() => router.push('/settings/notifications')}
            />
            <Divider />
            <MenuItem
              icon="📍"
              title="위치 설정"
              subtitle={user?.address?.dong || '설정 필요'}
              onPress={() => router.push('/location/select')}
            />
            <Divider />
            <MenuItem
              icon="🔒"
              title="개인정보 설정"
              onPress={() => router.push('/settings/privacy')}
            />
            <Divider />
            <MenuItem
              icon="❓"
              title="고객센터"
              onPress={() => {
                Alert.alert('고객센터', '문의: 1234-5678\n운영시간: 평일 09:00-18:00');
              }}
            />
          </View>
        </View>

        {/* 로그아웃 */}
        <View className="px-5 py-6">
          <Button
            title="로그아웃"
            variant="outline"
            fullWidth
            loading={isLoggingOut}
            onPress={handleLogout}
          />
        </View>

        {/* 앱 정보 */}
        <View className="items-center pb-8">
          <Text className="text-sm text-gray-400">이웃집시니어 v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
