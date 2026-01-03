/**
 * 위치 관련 API
 */

import { mockDelay } from './client';
import { mockUsers, mockProviderProfiles, findUserById } from '@/mocks/data';
import type { User, ProviderProfile } from '@/types';

export interface AddressSearchResult {
  address: string;
  roadAddress?: string;
  latitude: number;
  longitude: number;
  sido: string;
  sigungu: string;
  dong: string;
}

export interface NearbyProvider {
  user: User;
  profile: ProviderProfile;
  distance: number; // km
}

// 서울 강남 지역 Mock 주소들
const mockAddresses: AddressSearchResult[] = [
  {
    address: '서울특별시 강남구 역삼동 123-45',
    roadAddress: '서울특별시 강남구 테헤란로 123',
    latitude: 37.5000,
    longitude: 127.0367,
    sido: '서울특별시',
    sigungu: '강남구',
    dong: '역삼동',
  },
  {
    address: '서울특별시 강남구 삼성동 456-78',
    roadAddress: '서울특별시 강남구 봉은사로 456',
    latitude: 37.5088,
    longitude: 127.063,
    sido: '서울특별시',
    sigungu: '강남구',
    dong: '삼성동',
  },
  {
    address: '서울특별시 강남구 대치동 789-10',
    roadAddress: '서울특별시 강남구 삼성로 789',
    latitude: 37.4946,
    longitude: 127.0552,
    sido: '서울특별시',
    sigungu: '강남구',
    dong: '대치동',
  },
  {
    address: '서울특별시 강남구 논현동 111-22',
    roadAddress: '서울특별시 강남구 논현로 111',
    latitude: 37.5116,
    longitude: 127.0285,
    sido: '서울특별시',
    sigungu: '강남구',
    dong: '논현동',
  },
  {
    address: '서울특별시 서초구 서초동 333-44',
    roadAddress: '서울특별시 서초구 서초대로 333',
    latitude: 37.4837,
    longitude: 127.0167,
    sido: '서울특별시',
    sigungu: '서초구',
    dong: '서초동',
  },
];

/**
 * 두 좌표 간 거리 계산 (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // 지구 반경 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const locationApi = {
  /**
   * 주소 검색 (Geocoding)
   */
  searchAddress: async (query: string): Promise<AddressSearchResult[]> => {
    console.log('[Mock API] 주소 검색:', query);

    if (!query.trim()) {
      return mockDelay([]);
    }

    // Mock: 쿼리가 포함된 주소 필터링
    const results = mockAddresses.filter(
      addr =>
        addr.address.includes(query) ||
        addr.roadAddress?.includes(query) ||
        addr.dong.includes(query) ||
        addr.sigungu.includes(query)
    );

    // 결과가 없으면 기본 결과 반환
    if (results.length === 0) {
      return mockDelay([
        {
          address: `서울특별시 강남구 ${query}`,
          latitude: 37.5 + (Math.random() - 0.5) * 0.02,
          longitude: 127.03 + (Math.random() - 0.5) * 0.02,
          sido: '서울특별시',
          sigungu: '강남구',
          dong: query,
        },
      ]);
    }

    return mockDelay(results);
  },

  /**
   * 좌표로 주소 변환 (Reverse Geocoding)
   */
  reverseGeocode: async (
    latitude: number,
    longitude: number
  ): Promise<AddressSearchResult> => {
    console.log('[Mock API] 역지오코딩:', latitude, longitude);

    // Mock: 가장 가까운 주소 찾기
    let closestAddress = mockAddresses[0];
    let minDistance = Infinity;

    for (const addr of mockAddresses) {
      const distance = calculateDistance(
        latitude,
        longitude,
        addr.latitude,
        addr.longitude
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestAddress = addr;
      }
    }

    return mockDelay({
      ...closestAddress,
      latitude,
      longitude,
    });
  },

  /**
   * 주변 제공자 검색
   */
  getNearbyProviders: async (
    latitude: number,
    longitude: number,
    radiusKm: number = 3,
    category?: string
  ): Promise<NearbyProvider[]> => {
    console.log('[Mock API] 주변 제공자 검색:', latitude, longitude, radiusKm);

    const providers: NearbyProvider[] = [];

    for (const profile of mockProviderProfiles) {
      if (!profile.isActive) continue;

      const user = findUserById(profile.userId);
      if (!user || !user.location) continue;

      // 카테고리 필터링
      if (category) {
        const hasCategory = profile.services.some(
          s => s.category === category && s.isActive
        );
        if (!hasCategory) continue;
      }

      // 거리 계산
      const distance = calculateDistance(
        latitude,
        longitude,
        user.location.latitude,
        user.location.longitude
      );

      // 반경 내 제공자만
      if (distance <= radiusKm) {
        providers.push({
          user,
          profile,
          distance: Math.round(distance * 100) / 100, // 소수점 2자리
        });
      }
    }

    // 거리순 정렬
    providers.sort((a, b) => a.distance - b.distance);

    return mockDelay(providers);
  },

  /**
   * 두 지점 간 거리 계산
   */
  getDistance: async (
    fromLat: number,
    fromLon: number,
    toLat: number,
    toLon: number
  ): Promise<{ distanceKm: number; distanceMeters: number; estimatedMinutes: number }> => {
    console.log('[Mock API] 거리 계산');

    const distanceKm = calculateDistance(fromLat, fromLon, toLat, toLon);
    const distanceMeters = Math.round(distanceKm * 1000);
    // 도보 기준 시속 4km
    const estimatedMinutes = Math.round((distanceKm / 4) * 60);

    return mockDelay({
      distanceKm: Math.round(distanceKm * 100) / 100,
      distanceMeters,
      estimatedMinutes,
    });
  },

  /**
   * 현재 위치 저장
   */
  saveCurrentLocation: async (
    userId: string,
    latitude: number,
    longitude: number
  ): Promise<{ success: boolean }> => {
    console.log('[Mock API] 위치 저장:', userId, latitude, longitude);

    // Mock: 사용자 위치 업데이트 (실제로는 서버에 저장)
    const user = findUserById(userId);
    if (user) {
      user.location = { latitude, longitude };
    }

    return mockDelay({ success: true });
  },
};
