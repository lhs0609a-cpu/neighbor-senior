/**
 * 위치 선택 화면
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { useLocation, useAddressSearch } from '@/hooks';
import { useAuthStore } from '@/stores';
import { Button, Card } from '@/components/ui';
import ServiceMap from '@/components/Map/ServiceMap';
import { locationApi, type AddressSearchResult } from '@/services/api';
import { mockRecentLocations } from '@/mocks/data';

// 최근 사용 위치를 AddressSearchResult 형태로 변환
const recentLocations: AddressSearchResult[] = mockRecentLocations.map((loc) => ({
  address: loc.address,
  latitude: loc.latitude,
  longitude: loc.longitude,
  sido: '서울특별시',
  sigungu: '강남구',
  dong: loc.name,
}));

export default function LocationSelectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ returnTo?: string }>();
  const { getCurrentLocation, isLoading: isGettingLocation, address: currentAddress } = useLocation();
  const { query, setQuery, results, isSearching } = useAddressSearch();
  const updateUser = useAuthStore((state) => state.updateUser);

  const [selectedLocation, setSelectedLocation] = useState<AddressSearchResult | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // 현재 위치 사용
  const handleUseCurrentLocation = async () => {
    const result = await getCurrentLocation();
    if (result?.address) {
      setSelectedLocation(result.address);
    }
  };

  // 검색 결과 선택
  const handleSelectAddress = (address: AddressSearchResult) => {
    setSelectedLocation(address);
    setQuery('');
  };

  // 지도에서 위치 선택 - 역지오코딩 적용
  const handleMapSelect = useCallback(async (location: { latitude: number; longitude: number }) => {
    setIsReverseGeocoding(true);
    try {
      // 역지오코딩으로 좌표를 주소로 변환
      const addressResult = await locationApi.reverseGeocode(location.latitude, location.longitude);
      setSelectedLocation(addressResult);
    } catch (error) {
      // 역지오코딩 실패 시 기본값 사용
      setSelectedLocation({
        address: `위도: ${location.latitude.toFixed(4)}, 경도: ${location.longitude.toFixed(4)}`,
        latitude: location.latitude,
        longitude: location.longitude,
        sido: '',
        sigungu: '',
        dong: '선택한 위치',
      });
    } finally {
      setIsReverseGeocoding(false);
    }
  }, []);

  // 선택 완료 - 사용자 주소 업데이트
  const handleConfirm = useCallback(() => {
    if (selectedLocation) {
      // 사용자 주소 정보 업데이트
      updateUser({
        address: {
          sido: selectedLocation.sido || '서울특별시',
          sigungu: selectedLocation.sigungu || '',
          dong: selectedLocation.dong || '',
          detail: selectedLocation.address,
        },
        location: {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
        },
      });

      Alert.alert('위치 저장', '위치가 저장되었습니다.', [
        { text: '확인', onPress: () => router.back() },
      ]);
    }
  }, [selectedLocation, updateUser, router]);

  // 검색 결과 항목 렌더링
  const renderSearchResult = ({ item }: { item: AddressSearchResult }) => (
    <TouchableOpacity
      className="py-4 border-b border-gray-100"
      onPress={() => handleSelectAddress(item)}
    >
      <Text className="text-gray-900 font-medium">{item.address}</Text>
      {item.roadAddress && (
        <Text className="text-gray-500 text-sm mt-1">{item.roadAddress}</Text>
      )}
    </TouchableOpacity>
  );

  // 최근 위치 항목 렌더링
  const renderRecentLocation = ({ item }: { item: AddressSearchResult }) => (
    <TouchableOpacity
      className="flex-row items-center py-3"
      onPress={() => handleSelectAddress(item)}
    >
      <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
        <Text>🕐</Text>
      </View>
      <View className="flex-1">
        <Text className="text-gray-900">{item.dong}</Text>
        <Text className="text-gray-500 text-sm">{item.address}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '위치 선택',
          headerBackTitle: '취소',
        }}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 검색창 */}
        <View className="px-4 pt-4">
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4">
            <Text className="mr-2">🔍</Text>
            <TextInput
              className="flex-1 py-3 text-base"
              placeholder="주소 검색 (예: 역삼동, 테헤란로)"
              placeholderTextColor="#9CA3AF"
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Text className="text-gray-400">✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 현재 위치 사용 버튼 */}
        <TouchableOpacity
          className="flex-row items-center px-4 py-4 border-b border-gray-100"
          onPress={handleUseCurrentLocation}
          disabled={isGettingLocation}
        >
          <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-3">
            {isGettingLocation ? (
              <ActivityIndicator size="small" color="#4F46E5" />
            ) : (
              <Text>📍</Text>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-primary-600 font-medium">현재 위치 사용</Text>
            {currentAddress && (
              <Text className="text-gray-500 text-sm">{currentAddress.address}</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* 지도에서 선택 */}
        <TouchableOpacity
          className="flex-row items-center px-4 py-4 border-b border-gray-100"
          onPress={() => setShowMap(!showMap)}
        >
          <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
            <Text>🗺️</Text>
          </View>
          <Text className="flex-1 text-gray-900 font-medium">
            지도에서 선택
          </Text>
          <Text className="text-gray-400">{showMap ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {/* 지도 (토글) */}
        {showMap && (
          <View className="mx-4 my-2">
            <ServiceMap
              height={200}
              interactive
              onLocationSelect={handleMapSelect}
              showMyLocationButton
            />
          </View>
        )}

        {/* 검색 결과 또는 최근 위치 */}
        <View className="flex-1 px-4">
          {query.length > 0 ? (
            // 검색 결과
            <>
              {isSearching ? (
                <View className="py-8 items-center">
                  <ActivityIndicator size="small" color="#4F46E5" />
                  <Text className="mt-2 text-gray-500">검색 중...</Text>
                </View>
              ) : results.length > 0 ? (
                <FlatList
                  data={results}
                  keyExtractor={(item, index) => `${item.address}-${index}`}
                  renderItem={renderSearchResult}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View className="py-8 items-center">
                  <Text className="text-gray-500">검색 결과가 없습니다</Text>
                </View>
              )}
            </>
          ) : (
            // 최근 사용 위치
            <>
              <Text className="text-gray-500 text-sm mt-4 mb-2">최근 사용 위치</Text>
              <FlatList
                data={recentLocations}
                keyExtractor={(item, index) => `recent-${index}`}
                renderItem={renderRecentLocation}
                showsVerticalScrollIndicator={false}
              />
            </>
          )}
        </View>

        {/* 선택된 위치 표시 및 확인 버튼 */}
        {selectedLocation && (
          <View className="p-4 border-t border-gray-200 bg-white">
            <Card variant="outlined" padding="md" className="mb-4">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">📍</Text>
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium">
                    {selectedLocation.dong || '선택한 위치'}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {selectedLocation.address}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedLocation(null)}>
                  <Text className="text-gray-400">✕</Text>
                </TouchableOpacity>
              </View>
            </Card>
            <Button
              title="이 위치로 선택"
              fullWidth
              size="lg"
              onPress={handleConfirm}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
