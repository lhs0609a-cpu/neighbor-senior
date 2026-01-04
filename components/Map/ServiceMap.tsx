/**
 * 서비스 지도 컴포넌트
 * 현재 웹 빌드 호환성을 위해 플레이스홀더로 구현
 * TODO: 네이티브 빌드 시 react-native-maps 사용
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface ServiceMapProps {
  requestLocation?: Location;
  destination?: Location;
  providers?: Array<{
    id: string;
    name: string;
    location: Location;
    rating?: number;
  }>;
  radiusKm?: number;
  height?: number;
  interactive?: boolean;
  onLocationSelect?: (location: Location) => void;
  onProviderSelect?: (providerId: string) => void;
  showMyLocationButton?: boolean;
}

export function ServiceMap({
  requestLocation,
  destination,
  providers = [],
  height = 300,
}: ServiceMapProps) {
  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.placeholder}>
        <Text style={styles.icon}>🗺️</Text>
        <Text style={styles.title}>지도 영역</Text>
        {requestLocation?.address && (
          <Text style={styles.address}>{requestLocation.address}</Text>
        )}
        {destination?.address && (
          <Text style={styles.destination}>→ {destination.address}</Text>
        )}
        {providers.length > 0 && (
          <Text style={styles.providers}>
            주변 제공자 {providers.length}명
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  destination: {
    fontSize: 14,
    color: '#10B981',
    marginTop: 4,
  },
  providers: {
    fontSize: 12,
    color: '#F97316',
    marginTop: 8,
    fontWeight: '500',
  },
});

export default ServiceMap;
