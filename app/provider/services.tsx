/**
 * 제공 서비스 설정 화면
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
import { CATEGORY_NAMES, CATEGORY_ICONS, CATEGORY_SUBCATEGORIES } from '@/constants/prices';
import type { ServiceCategory } from '@/types';

interface ServiceItem {
  category: ServiceCategory;
  subcategory: string;
  name: string;
  isActive: boolean;
}

// 초기 서비스 목록 생성
const createInitialServices = (): ServiceItem[] => {
  const services: ServiceItem[] = [];

  Object.entries(CATEGORY_SUBCATEGORIES).forEach(([category, subcategories]) => {
    Object.entries(subcategories).forEach(([subcategory, info]) => {
      services.push({
        category: category as ServiceCategory,
        subcategory,
        name: info.name,
        isActive: false,
      });
    });
  });

  return services;
};

export default function ProviderServicesScreen() {
  const [services, setServices] = useState<ServiceItem[]>(() => {
    const initial = createInitialServices();
    // 몇 개는 기본으로 활성화
    return initial.map((s) =>
      ['pickup_dropoff', 'side_dish_3', 'phone_setup'].includes(s.subcategory)
        ? { ...s, isActive: true }
        : s
    );
  });
  const [expandedCategory, setExpandedCategory] = useState<ServiceCategory | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const toggleService = (subcategory: string) => {
    setServices((prev) =>
      prev.map((s) =>
        s.subcategory === subcategory ? { ...s, isActive: !s.isActive } : s
      )
    );
    setHasChanges(true);
  };

  const toggleCategory = (category: ServiceCategory) => {
    setExpandedCategory((prev) => (prev === category ? null : category));
  };

  const handleSave = () => {
    const activeCount = services.filter((s) => s.isActive).length;
    Alert.alert(
      '저장 완료',
      `${activeCount}개의 서비스가 활성화되었습니다.`,
      [{ text: '확인' }]
    );
    setHasChanges(false);
  };

  // 카테고리별 그룹화
  const groupedServices = React.useMemo(() => {
    const groups: Record<ServiceCategory, ServiceItem[]> = {} as any;
    services.forEach((service) => {
      if (!groups[service.category]) {
        groups[service.category] = [];
      }
      groups[service.category].push(service);
    });
    return groups;
  }, [services]);

  const categories = Object.keys(groupedServices) as ServiceCategory[];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '제공 서비스 설정',
          headerBackTitle: '뒤로',
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4">
          <Text className="text-gray-600 text-sm mb-4">
            제공할 수 있는 서비스를 선택해주세요. 선택한 서비스에 맞는 요청만 받게 됩니다.
          </Text>

          {categories.map((category) => {
            const categoryServices = groupedServices[category];
            const activeCount = categoryServices.filter((s) => s.isActive).length;
            const isExpanded = expandedCategory === category;

            return (
              <Card key={category} variant="outlined" padding="none" className="mb-3">
                <TouchableOpacity
                  className="flex-row items-center justify-between p-4"
                  onPress={() => toggleCategory(category)}
                >
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-3">
                      {CATEGORY_ICONS[category] || '📌'}
                    </Text>
                    <View>
                      <Text className="text-base font-medium text-gray-900">
                        {CATEGORY_NAMES[category] || category}
                      </Text>
                      <Text className="text-xs text-gray-500 mt-0.5">
                        {activeCount}개 활성화 / {categoryServices.length}개
                      </Text>
                    </View>
                  </View>
                  <Text className="text-gray-400 text-lg">
                    {isExpanded ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View className="border-t border-gray-100">
                    {categoryServices.map((service) => (
                      <View
                        key={service.subcategory}
                        className="flex-row items-center justify-between px-4 py-3 border-b border-gray-50"
                      >
                        <Text className="text-gray-700 flex-1 mr-3">
                          {service.name}
                        </Text>
                        <Switch
                          value={service.isActive}
                          onValueChange={() => toggleService(service.subcategory)}
                          trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                          thumbColor="white"
                        />
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            );
          })}
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
