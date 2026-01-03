/**
 * 알림 설정 화면
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useNotifications, useNotificationSettings } from '@/hooks';
import { Card } from '@/components/ui';

// 알림 설정 항목 타입
interface NotificationSettingItem {
  key: keyof ReturnType<typeof useNotificationSettings>['settings'];
  title: string;
  description: string;
  icon: string;
}

// 알림 설정 항목들
const NOTIFICATION_ITEMS: NotificationSettingItem[] = [
  {
    key: 'newRequest',
    title: '새 요청 알림',
    description: '주변에 새로운 서비스 요청이 등록되면 알림',
    icon: '📋',
  },
  {
    key: 'matching',
    title: '매칭 알림',
    description: '요청이 매칭되었을 때 알림',
    icon: '🤝',
  },
  {
    key: 'chat',
    title: '채팅 알림',
    description: '새 메시지가 도착하면 알림',
    icon: '💬',
  },
  {
    key: 'payment',
    title: '결제 알림',
    description: '결제 및 입금 관련 알림',
    icon: '💰',
  },
  {
    key: 'marketing',
    title: '마케팅 알림',
    description: '이벤트 및 프로모션 알림',
    icon: '🎁',
  },
];

// 설정 항목 컴포넌트
function SettingItem({
  item,
  value,
  onValueChange,
}: {
  item: NotificationSettingItem;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
      <View className="flex-row items-center flex-1 mr-4">
        <Text className="text-2xl mr-3">{item.icon}</Text>
        <View className="flex-1">
          <Text className="text-gray-900 font-medium">{item.title}</Text>
          <Text className="text-gray-500 text-sm mt-1">{item.description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
        thumbColor="white"
        ios_backgroundColor="#E5E7EB"
      />
    </View>
  );
}

export default function NotificationSettingsScreen() {
  const { hasPermission, requestPermission, sendTestNotification } = useNotifications();
  const { settings, updateSetting } = useNotificationSettings();

  // 시스템 설정으로 이동
  const handleOpenSettings = () => {
    Alert.alert(
      '알림 권한',
      '기기 설정에서 알림 권한을 변경할 수 있습니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: '설정으로 이동', onPress: () => Linking.openSettings() },
      ]
    );
  };

  // 알림 테스트
  const handleTestNotification = () => {
    Alert.alert('알림 테스트', '어떤 알림을 테스트하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '채팅 알림', onPress: () => sendTestNotification('chat') },
      { text: '매칭 알림', onPress: () => sendTestNotification('matching') },
      { text: '새 요청 알림', onPress: () => sendTestNotification('request') },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '알림 설정',
          headerBackTitle: '뒤로',
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 알림 권한 상태 */}
        <View className="px-4 pt-4">
          <Card
            variant={hasPermission ? 'outlined' : 'elevated'}
            padding="lg"
            className={hasPermission ? '' : 'bg-yellow-50 border-yellow-200'}
          >
            <View className="flex-row items-center">
              <Text className="text-3xl mr-3">
                {hasPermission ? '🔔' : '🔕'}
              </Text>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold">
                  {hasPermission ? '알림이 켜져 있습니다' : '알림이 꺼져 있습니다'}
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  {hasPermission
                    ? '중요한 알림을 받을 수 있습니다'
                    : '알림을 받으려면 권한을 허용해주세요'}
                </Text>
              </View>
              {!hasPermission && (
                <TouchableOpacity
                  onPress={requestPermission}
                  className="bg-primary-600 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-medium">허용</Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
        </View>

        {/* 알림 설정 항목들 */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            알림 종류
          </Text>

          <Card variant="outlined" padding="md">
            {NOTIFICATION_ITEMS.map((item) => (
              <SettingItem
                key={item.key}
                item={item}
                value={settings[item.key]}
                onValueChange={(value) => updateSetting(item.key, value)}
              />
            ))}
          </Card>
        </View>

        {/* 방해 금지 시간 */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            방해 금지
          </Text>

          <Card variant="outlined" padding="lg">
            <TouchableOpacity className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">🌙</Text>
                <View>
                  <Text className="text-gray-900 font-medium">방해 금지 시간</Text>
                  <Text className="text-gray-500 text-sm mt-1">
                    설정한 시간에는 알림을 받지 않습니다
                  </Text>
                </View>
              </View>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>
            <View className="mt-3 p-3 bg-gray-50 rounded-lg">
              <Text className="text-gray-500 text-sm text-center">
                오후 10:00 ~ 오전 7:00
              </Text>
            </View>
          </Card>
        </View>

        {/* 알림 테스트 (개발용) */}
        <View className="px-4 mt-6 mb-8">
          <Card variant="outlined" padding="lg">
            <TouchableOpacity
              className="flex-row items-center justify-between"
              onPress={handleTestNotification}
            >
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">🔔</Text>
                <View>
                  <Text className="text-gray-900 font-medium">알림 테스트</Text>
                  <Text className="text-gray-500 text-sm mt-1">
                    테스트 알림을 보내봅니다
                  </Text>
                </View>
              </View>
              <Text className="text-primary-600">테스트</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* 시스템 설정 안내 */}
        <View className="px-4 mb-8">
          <TouchableOpacity
            className="flex-row items-center justify-center py-3"
            onPress={handleOpenSettings}
          >
            <Text className="text-gray-400 text-sm">
              기기 설정에서 알림 관리하기 →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
