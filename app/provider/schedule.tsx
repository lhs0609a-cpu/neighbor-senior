/**
 * 활동 시간 설정 화면
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
import { Stack } from 'expo-router';
import { Card, Button } from '@/components/ui';

interface DaySchedule {
  dayOfWeek: number;
  dayName: string;
  isActive: boolean;
  startTime: string;
  endTime: string;
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

const TIME_OPTIONS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00',
];

const initialSchedule: DaySchedule[] = DAY_NAMES.map((name, index) => ({
  dayOfWeek: index,
  dayName: name,
  isActive: index >= 1 && index <= 5, // 월-금 기본 활성화
  startTime: '09:00',
  endTime: '18:00',
}));

function TimeSelector({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View className="flex-1">
      <Text className="text-xs text-gray-500 mb-1">{label}</Text>
      <TouchableOpacity
        className="bg-gray-100 px-3 py-2 rounded-lg"
        onPress={() => setShowPicker(!showPicker)}
      >
        <Text className="text-gray-900 text-center">{value}</Text>
      </TouchableOpacity>
      {showPicker && (
        <View className="absolute top-14 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40">
          <ScrollView>
            {options.map((time) => (
              <TouchableOpacity
                key={time}
                className={`px-3 py-2 ${value === time ? 'bg-primary-50' : ''}`}
                onPress={() => {
                  onChange(time);
                  setShowPicker(false);
                }}
              >
                <Text
                  className={`text-center ${
                    value === time ? 'text-primary-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

export default function ProviderScheduleScreen() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule);
  const [hasChanges, setHasChanges] = useState(false);

  const toggleDay = (dayOfWeek: number) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, isActive: !day.isActive } : day
      )
    );
    setHasChanges(true);
  };

  const updateTime = (
    dayOfWeek: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, [field]: value } : day
      )
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    const activeDays = schedule.filter((d) => d.isActive);
    if (activeDays.length === 0) {
      Alert.alert('알림', '최소 하루 이상 활동 시간을 설정해주세요.');
      return;
    }

    Alert.alert(
      '저장 완료',
      `${activeDays.length}일 활동 시간이 설정되었습니다.`,
      [{ text: '확인' }]
    );
    setHasChanges(false);
  };

  const applyToAll = () => {
    Alert.alert(
      '일괄 적용',
      '첫 번째 활성화된 요일의 시간을 모든 요일에 적용할까요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '적용',
          onPress: () => {
            const firstActive = schedule.find((d) => d.isActive);
            if (firstActive) {
              setSchedule((prev) =>
                prev.map((day) => ({
                  ...day,
                  startTime: firstActive.startTime,
                  endTime: firstActive.endTime,
                }))
              );
              setHasChanges(true);
            }
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
          headerTitle: '활동 시간 설정',
          headerBackTitle: '뒤로',
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4">
          <Text className="text-gray-600 text-sm mb-4">
            활동 가능한 요일과 시간을 설정해주세요. 설정한 시간에만 요청 알림을 받습니다.
          </Text>

          <TouchableOpacity
            className="mb-4"
            onPress={applyToAll}
          >
            <Text className="text-primary-600 text-sm text-right">
              시간 일괄 적용
            </Text>
          </TouchableOpacity>

          {schedule.map((day) => (
            <Card key={day.dayOfWeek} variant="outlined" padding="md" className="mb-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                      day.isActive ? 'bg-primary-100' : 'bg-gray-100'
                    }`}
                  >
                    <Text
                      className={`text-base font-bold ${
                        day.isActive ? 'text-primary-600' : 'text-gray-400'
                      }`}
                    >
                      {day.dayName}
                    </Text>
                  </View>
                  <Text
                    className={`text-base ${
                      day.isActive ? 'text-gray-900 font-medium' : 'text-gray-400'
                    }`}
                  >
                    {day.dayName}요일
                  </Text>
                </View>
                <Switch
                  value={day.isActive}
                  onValueChange={() => toggleDay(day.dayOfWeek)}
                  trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                  thumbColor="white"
                />
              </View>

              {day.isActive && (
                <View className="flex-row mt-4 gap-3">
                  <TimeSelector
                    label="시작 시간"
                    value={day.startTime}
                    onChange={(value) => updateTime(day.dayOfWeek, 'startTime', value)}
                    options={TIME_OPTIONS}
                  />
                  <View className="justify-center pt-5">
                    <Text className="text-gray-400">~</Text>
                  </View>
                  <TimeSelector
                    label="종료 시간"
                    value={day.endTime}
                    onChange={(value) => updateTime(day.dayOfWeek, 'endTime', value)}
                    options={TIME_OPTIONS.filter((t) => t > day.startTime)}
                  />
                </View>
              )}
            </Card>
          ))}
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
