import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '@/stores';

import '../global.css';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const { isLoading, setLoading } = useAuthStore();

  useEffect(() => {
    // 앱 초기화 로직
    const initApp = async () => {
      try {
        // 여기서 토큰 검증, 사용자 정보 로드 등
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('App init error:', error);
      } finally {
        setLoading(false);
        SplashScreen.hideAsync();
      }
    };

    initApp();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen
              name="request/create"
              options={{
                presentation: 'modal',
                headerShown: true,
                headerTitle: '요청하기',
              }}
            />
            <Stack.Screen
              name="request/[id]"
              options={{
                headerShown: true,
                headerTitle: '요청 상세',
              }}
            />
            <Stack.Screen
              name="request/matching"
              options={{
                headerShown: false,
                presentation: 'fullScreenModal',
              }}
            />
            <Stack.Screen
              name="chat/[id]"
              options={{
                headerShown: true,
                headerTitle: '채팅',
              }}
            />
            <Stack.Screen
              name="charge/index"
              options={{
                headerShown: true,
                headerTitle: '잔액 충전',
              }}
            />
            <Stack.Screen
              name="profile/edit"
              options={{
                headerShown: true,
                headerTitle: '프로필 편집',
              }}
            />
            <Stack.Screen
              name="location/select"
              options={{
                presentation: 'modal',
                headerShown: true,
                headerTitle: '위치 선택',
              }}
            />
            <Stack.Screen
              name="settings/notifications"
              options={{
                headerShown: true,
                headerTitle: '알림 설정',
              }}
            />
            <Stack.Screen
              name="settings/privacy"
              options={{
                headerShown: true,
                headerTitle: '개인정보 설정',
              }}
            />
            <Stack.Screen
              name="payment/history"
              options={{
                headerShown: true,
                headerTitle: '결제 내역',
              }}
            />
            <Stack.Screen
              name="reviews/index"
              options={{
                headerShown: true,
                headerTitle: '리뷰 관리',
              }}
            />
            <Stack.Screen
              name="provider/services"
              options={{
                headerShown: true,
                headerTitle: '제공 서비스 설정',
              }}
            />
            <Stack.Screen
              name="provider/schedule"
              options={{
                headerShown: true,
                headerTitle: '활동 시간 설정',
              }}
            />
            <Stack.Screen
              name="provider/earnings"
              options={{
                headerShown: true,
                headerTitle: '수익 관리',
              }}
            />
          </Stack>
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
