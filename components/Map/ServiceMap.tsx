/**
 * 서비스 지도 컴포넌트
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useLocation } from '@/hooks';

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface ServiceMapProps {
  // 요청 위치 표시
  requestLocation?: Location;
  // 목적지 (이동 서비스용)
  destination?: Location;
  // 주변 제공자 표시
  providers?: Array<{
    id: string;
    name: string;
    location: Location;
    rating?: number;
  }>;
  // 반경 표시 (km)
  radiusKm?: number;
  // 높이
  height?: number;
  // 터치 가능 여부
  interactive?: boolean;
  // 위치 선택 콜백
  onLocationSelect?: (location: Location) => void;
  // 제공자 선택 콜백
  onProviderSelect?: (providerId: string) => void;
  // 현재 위치 버튼 표시
  showMyLocationButton?: boolean;
}

export function ServiceMap({
  requestLocation,
  destination,
  providers = [],
  radiusKm = 1,
  height = 300,
  interactive = false,
  onLocationSelect,
  onProviderSelect,
  showMyLocationButton = true,
}: ServiceMapProps) {
  const { location, getCurrentLocation, isLoading } = useLocation();
  const [region, setRegion] = useState<Region | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // 초기 지역 설정
  useEffect(() => {
    const initialLocation = requestLocation || (location ? {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    } : null);

    if (initialLocation) {
      setRegion({
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else {
      // 위치 없으면 현재 위치 가져오기
      getCurrentLocation();
    }
  }, [requestLocation, location]);

  // 지도 탭 핸들러
  const handleMapPress = (e: any) => {
    if (!interactive) return;

    const { latitude, longitude } = e.nativeEvent.coordinate;
    const newLocation = { latitude, longitude };
    setSelectedLocation(newLocation);
    onLocationSelect?.(newLocation);
  };

  // 현재 위치로 이동
  const handleMyLocation = async () => {
    const result = await getCurrentLocation();
    if (result?.location) {
      setRegion({
        latitude: result.location.coords.latitude,
        longitude: result.location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  // 로딩 또는 위치 없음
  if (isLoading || !region) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>지도를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        style={styles.map}
        initialRegion={region}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={handleMapPress}
        // provider={PROVIDER_GOOGLE} // iOS에서는 Apple Maps 사용
      >
        {/* 요청 위치 마커 */}
        {requestLocation && (
          <Marker
            coordinate={{
              latitude: requestLocation.latitude,
              longitude: requestLocation.longitude,
            }}
            title="요청 위치"
            description={requestLocation.address}
            pinColor="#4F46E5"
          />
        )}

        {/* 목적지 마커 */}
        {destination && (
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            title="목적지"
            description={destination.address}
            pinColor="#10B981"
          />
        )}

        {/* 선택된 위치 마커 (인터랙티브 모드) */}
        {interactive && selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title="선택한 위치"
            pinColor="#F97316"
          />
        )}

        {/* 서비스 반경 표시 */}
        {requestLocation && radiusKm > 0 && (
          <Circle
            center={{
              latitude: requestLocation.latitude,
              longitude: requestLocation.longitude,
            }}
            radius={radiusKm * 1000}
            fillColor="rgba(79, 70, 229, 0.1)"
            strokeColor="rgba(79, 70, 229, 0.3)"
            strokeWidth={1}
          />
        )}

        {/* 제공자 마커 */}
        {providers.map((provider) => (
          <Marker
            key={provider.id}
            coordinate={{
              latitude: provider.location.latitude,
              longitude: provider.location.longitude,
            }}
            title={provider.name}
            description={provider.rating ? `⭐ ${provider.rating}` : undefined}
            onPress={() => onProviderSelect?.(provider.id)}
          >
            <View style={styles.providerMarker}>
              <Text style={styles.providerMarkerText}>👵</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* 현재 위치 버튼 */}
      {showMyLocationButton && (
        <TouchableOpacity
          style={styles.myLocationButton}
          onPress={handleMyLocation}
        >
          <Text style={styles.myLocationIcon}>📍</Text>
        </TouchableOpacity>
      )}

      {/* 선택된 위치 정보 */}
      {interactive && selectedLocation && (
        <View style={styles.selectedInfo}>
          <Text style={styles.selectedInfoText}>
            위치가 선택되었습니다
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 14,
  },
  providerMarker: {
    backgroundColor: '#F97316',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  providerMarkerText: {
    fontSize: 16,
  },
  myLocationButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 44,
    height: 44,
    backgroundColor: 'white',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  myLocationIcon: {
    fontSize: 20,
  },
  selectedInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 72,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedInfoText: {
    color: '#374151',
    fontSize: 14,
  },
});

export default ServiceMap;
