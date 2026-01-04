/**
 * 위치 서비스 관련 커스텀 훅
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores';
import { locationApi, type AddressSearchResult, type NearbyProvider } from '@/services/api';

// 위치 객체 타입 정의
interface LocationObject {
  coords: {
    latitude: number;
    longitude: number;
    altitude?: number | null;
    accuracy?: number | null;
    heading?: number | null;
    speed?: number | null;
  };
  timestamp: number;
}

/**
 * 현재 위치 훅
 */
export const useLocation = () => {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [address, setAddress] = useState<AddressSearchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const updateUser = useAuthStore((state) => state.updateUser);

  // 웹에서는 기본 위치 반환
  const getDefaultLocation = useCallback(() => {
    // 서울 강남구 역삼동 기본 좌표
    return {
      coords: {
        latitude: 37.5012,
        longitude: 127.0396,
        altitude: null,
        accuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };
  }, []);

  // 권한 확인
  const checkPermission = useCallback(async () => {
    if (Platform.OS === 'web') {
      return true; // 웹에서는 항상 true 반환
    }

    try {
      const Location = require('expo-location');
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);
      return status === 'granted';
    } catch (error) {
      console.error('권한 확인 실패:', error);
      return false;
    }
  }, []);

  // 권한 요청
  const requestPermission = useCallback(async () => {
    if (Platform.OS === 'web') {
      return true; // 웹에서는 항상 true 반환
    }

    try {
      const Location = require('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== 'granted') {
        setErrorMsg('위치 권한이 필요합니다');

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
    } catch (error) {
      console.error('권한 요청 실패:', error);
      return false;
    }
  }, []);

  // 현재 위치 가져오기
  const getCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      // 웹에서는 기본 위치 사용
      if (Platform.OS === 'web') {
        const defaultLoc = getDefaultLocation();
        setLocation(defaultLoc);

        const addressResult = await locationApi.reverseGeocode(
          defaultLoc.coords.latitude,
          defaultLoc.coords.longitude
        );
        setAddress(addressResult);

        updateUser({
          location: {
            latitude: defaultLoc.coords.latitude,
            longitude: defaultLoc.coords.longitude,
          },
          address: {
            sido: addressResult.sido,
            sigungu: addressResult.sigungu,
            dong: addressResult.dong,
          },
        });

        return {
          location: defaultLoc,
          address: addressResult,
        };
      }

      // 네이티브에서는 실제 위치 사용
      const Location = require('expo-location');

      const hasPermission = await checkPermission();
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          setIsLoading(false);
          return null;
        }
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(currentLocation);

      const addressResult = await locationApi.reverseGeocode(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
      setAddress(addressResult);

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
  }, [checkPermission, requestPermission, updateUser, getDefaultLocation]);

  // 위치 모니터링 (실시간) - 네이티브 전용
  const watchLocation = useCallback(async (callback: (location: LocationObject) => void) => {
    if (Platform.OS === 'web') {
      // 웹에서는 기본 위치로 한 번 호출
      const defaultLoc = getDefaultLocation();
      callback(defaultLoc);
      return null;
    }

    try {
      const Location = require('expo-location');

      const hasPermission = await checkPermission();
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) return null;
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000,
          distanceInterval: 50,
        },
        (newLocation: LocationObject) => {
          setLocation(newLocation);
          callback(newLocation);
        }
      );

      return subscription;
    } catch (error) {
      console.error('위치 모니터링 실패:', error);
      return null;
    }
  }, [checkPermission, requestPermission, getDefaultLocation]);

  return {
    location,
    address,
    errorMsg,
    isLoading,
    permissionStatus,
    getCurrentLocation,
    watchLocation,
    checkPermission,
    requestPermission,
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
    staleTime: 5 * 60 * 1000,
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
    staleTime: Infinity,
  });
};
