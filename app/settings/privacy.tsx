/**
 * 개인정보 설정 화면
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Card, Button } from '@/components/ui';
import { mockPrivacySettings, type PrivacySettings } from '@/mocks/data';

interface SettingItemProps {
  icon: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function SettingItem({ icon, title, description, value, onValueChange }: SettingItemProps) {
  return (
    <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
      <View className="flex-row items-center flex-1 mr-4">
        <Text className="text-2xl mr-3">{icon}</Text>
        <View className="flex-1">
          <Text className="text-gray-900 font-medium">{title}</Text>
          <Text className="text-gray-500 text-sm mt-1">{description}</Text>
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

const DATA_RETENTION_OPTIONS: { value: PrivacySettings['dataRetentionDays']; label: string }[] = [
  { value: 90, label: '3개월' },
  { value: 180, label: '6개월' },
  { value: 365, label: '1년' },
];

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<PrivacySettings>(mockPrivacySettings);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = <K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    Alert.alert('저장 완료', '개인정보 설정이 저장되었습니다.');
    setHasChanges(false);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '계정 삭제',
      '정말 계정을 삭제하시겠습니까?\n\n삭제된 계정은 복구할 수 없으며, 모든 데이터가 영구적으로 삭제됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '최종 확인',
              '계정 삭제를 진행하시려면 "삭제 확인" 버튼을 눌러주세요.',
              [
                { text: '취소', style: 'cancel' },
                {
                  text: '삭제 확인',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert('알림', '계정이 삭제되었습니다.');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      '내 데이터 내보내기',
      '가입 시 사용한 이메일로 데이터를 전송합니다.\n\n처리까지 최대 48시간이 소요될 수 있습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '요청',
          onPress: () => {
            Alert.alert('요청 완료', '데이터 내보내기를 요청했습니다.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '개인정보 설정',
          headerBackTitle: '뒤로',
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 공개 설정 */}
        <View className="px-4 pt-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            정보 공개 설정
          </Text>

          <Card variant="outlined" padding="md">
            <SettingItem
              icon="📱"
              title="전화번호 공개"
              description="매칭된 상대방에게 전화번호 표시"
              value={settings.showPhoneNumber}
              onValueChange={(v) => updateSetting('showPhoneNumber', v)}
            />
            <SettingItem
              icon="📍"
              title="주소 공개"
              description="프로필에 동네 정보 표시"
              value={settings.showAddress}
              onValueChange={(v) => updateSetting('showAddress', v)}
            />
            <SettingItem
              icon="👤"
              title="비회원 프로필 공개"
              description="로그인하지 않은 사용자에게 프로필 표시"
              value={settings.showProfileToNonMembers}
              onValueChange={(v) => updateSetting('showProfileToNonMembers', v)}
            />
            <SettingItem
              icon="🗺️"
              title="위치 추적 허용"
              description="서비스 진행 중 실시간 위치 공유"
              value={settings.allowLocationTracking}
              onValueChange={(v) => updateSetting('allowLocationTracking', v)}
            />
          </Card>
        </View>

        {/* 데이터 보관 */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            데이터 보관 기간
          </Text>

          <Card variant="outlined" padding="md">
            <Text className="text-sm text-gray-500 mb-3">
              서비스 이용 기록 보관 기간을 선택하세요
            </Text>
            <View className="flex-row gap-2">
              {DATA_RETENTION_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className={`flex-1 py-3 rounded-lg border ${
                    settings.dataRetentionDays === option.value
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200'
                  }`}
                  onPress={() => updateSetting('dataRetentionDays', option.value)}
                >
                  <Text
                    className={`text-center font-medium ${
                      settings.dataRetentionDays === option.value
                        ? 'text-primary-600'
                        : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </View>

        {/* 데이터 관리 */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            데이터 관리
          </Text>

          <Card variant="outlined" padding="none">
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-gray-100"
              onPress={handleExportData}
            >
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">📦</Text>
                <View>
                  <Text className="text-gray-900 font-medium">내 데이터 내보내기</Text>
                  <Text className="text-gray-500 text-sm mt-0.5">
                    모든 개인 데이터를 다운로드
                  </Text>
                </View>
              </View>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between p-4"
              onPress={handleDeleteAccount}
            >
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">🗑️</Text>
                <View>
                  <Text className="text-red-600 font-medium">계정 삭제</Text>
                  <Text className="text-gray-500 text-sm mt-0.5">
                    모든 데이터가 영구 삭제됩니다
                  </Text>
                </View>
              </View>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* 약관 */}
        <View className="px-4 mt-6 mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            약관 및 정책
          </Text>

          <Card variant="outlined" padding="none">
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-gray-100"
              onPress={() => Alert.alert('알림', '이용약관 페이지로 이동합니다.')}
            >
              <Text className="text-gray-900">이용약관</Text>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-gray-100"
              onPress={() => Alert.alert('알림', '개인정보처리방침 페이지로 이동합니다.')}
            >
              <Text className="text-gray-900">개인정보처리방침</Text>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center justify-between p-4"
              onPress={() => Alert.alert('알림', '위치기반서비스 이용약관 페이지로 이동합니다.')}
            >
              <Text className="text-gray-900">위치기반서비스 이용약관</Text>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>

      {/* 저장 버튼 */}
      {hasChanges && (
        <View className="px-4 py-4 bg-white border-t border-gray-200">
          <Button title="저장하기" onPress={handleSave} fullWidth />
        </View>
      )}
    </SafeAreaView>
  );
}
