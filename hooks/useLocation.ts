/**
 * 위치 서비스 관련 커스텀 훅
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import * as Location from 'expo-location';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores';
import { locationApi, type AddressSearchResult, type NearbyProvider } from '@/services/api';

/**
 * 현재 위치 훅
 */
export const useLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<AddressSearchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  const updateUser = useAuthStore((state) => state.updateUser);

  // 권한 확인
  const checkPermission = useCallback(async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setPermissionStatus(status);
    return status === 'granted';
  }, []);

  // 권한 요청
  const requestPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermissionStatus(status);

    if (status !== 'granted') {
      setErrorMsg('위치 권한이 필요합니다');

      // 설정으로 이동 안내
      Alert.alert(
        '위치 권한 필요',
        '서비스 이용을 위해 위치 권한이 필요합니다. 설정에서 위치 권한을 허용해주세요.',
        [
          { text: '취소', style: 'cancel' },
          { text: '설정으로 이동', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }

    return true;
  }, []);

  // 현재 위치 가져오기
  const getCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      // 권한 확인/요청
      const hasPermission = await checkPermission();
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          setIsLoading(false);
          return null;
        }
      }

      // 현재 위치 조회
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(currentLocation);

      // 역지오코딩으로 주소 변환
      const addressResult = await locationApi.reverseGeocode(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
      setAddress(addressResult);

      // 사용자 정보에 위치 저장
      updateUser({
        location: {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        },
        address: {
          sido: addressResult.sido,
          sigungu: addressResult.sigungu,
          dong: addressResult.dong,
        },
      });

      return {
        location: currentLocation,
        address: addressResult,
      };
    } catch (error) {
      console.error('위치 조회 실패:', error);
      setErrorMsg('위치를 가져올 수 없습니다');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [checkPermission, requestPermission, updateUser]);

  // 위치 모니터링 (실시간)
  const watchLocation = useCallback(async (callback: (location: Location.LocationObject) => void) => {
    const hasPermission = await checkPermission();
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return null;
    }

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000, // 10초
        distanceInterval: 50, // 50미터
      },
      (newLocation) => {
        setLocation(newLocation);
        callback(newLocation);
      }
    );

    return subscription;
  }, [checkPermission, requestPermission]);

  return {
    // 상태
    location,
    address,
    errorMsg,
    isLoading,
    permissionStatus,

    // 액션
    getCurrentLocation,
    watchLocation,
    checkPermission,
    requestPermission,

    // 편의 속성
    hasLocation: !!location,
    coordinates: location
      ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }
      : null,
  };
};

/**
 * 주소 검색 훅
 */
export const useAddressSearch = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // 디바운싱
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const searchQuery = useQuery({
    queryKey: ['addressSearch', debouncedQuery],
    queryFn: () => locationApi.searchAddress(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5분
  });

  return {
    query,
    setQuery,
    results: searchQuery.data || [],
    isSearching: searchQuery.isLoading,
    error: searchQuery.error,
  };
};

/**
 * 주변 제공자 검색 훅
 */
export const useNearbyProviders = (
  latitude?: number,
  longitude?: number,
  radiusKm: number = 3,
  category?: string
) => {
  return useQuery({
    queryKey: ['nearbyProviders', latitude, longitude, radiusKm, category],
    queryFn: () =>
      locationApi.getNearbyProviders(latitude!, longitude!, radiusKm, category),
    enabled: !!latitude && !!longitude,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
};

/**
 * 두 지점 간 거리 계산 훅
 */
export const useDistance = (
  fromLat?: number,
  fromLon?: number,
  toLat?: number,
  toLon?: number
) => {
  return useQuery({
    queryKey: ['distance', fromLat, fromLon, toLat, toLon],
    queryFn: () => locationApi.getDistance(fromLat!, fromLon!, toLat!, toLon!),
    enabled: !!fromLat && !!fromLon && !!toLat && !!toLon,
    staleTime: Infinity, // 좌표가 같으면 결과도 같음
  });
};
