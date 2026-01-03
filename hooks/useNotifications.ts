/**
 * 푸시 알림 관련 커스텀 훅
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores';

// 알림 핸들러 설정 (앱이 포그라운드일 때 알림 표시)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

/**
 * 푸시 알림 훅
 */
export const useNotifications = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  // 푸시 토큰 등록
  const registerForPushNotifications = useCallback(async () => {
    let token: string | undefined;

    // 실제 디바이스에서만 동작
    if (!Device.isDevice) {
      console.log('푸시 알림은 실제 디바이스에서만 작동합니다');
      return null;
    }

    // 권한 확인
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // 권한 요청
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('푸시 알림 권한이 거부되었습니다');
      setHasPermission(false);
      return null;
    }

    setHasPermission(true);

    // Expo 푸시 토큰 가져오기
    try {
      const pushToken = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });
      token = pushToken.data;
      setExpoPushToken(token);
    } catch (error) {
      console.error('푸시 토큰 가져오기 실패:', error);
    }

    // Android 알림 채널 설정
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: '기본 알림',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F97316',
      });

      await Notifications.setNotificationChannelAsync('chat', {
        name: '채팅 알림',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 100, 100, 100],
      });

      await Notifications.setNotificationChannelAsync('request', {
        name: '요청 알림',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    return token;
  }, []);

  // 알림 설정 초기화
  useEffect(() => {
    registerForPushNotifications();

    // 알림 수신 리스너 (앱이 포그라운드일 때)
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('알림 수신:', notification);
      }
    );

    // 알림 클릭 리스너
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        handleNotificationPress(data);
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // 알림 클릭 처리
  const handleNotificationPress = useCallback(
    (data: Record<string, unknown>) => {
      const type = data.type as string;
      const id = data.id as string;

      switch (type) {
        case 'chat':
          if (data.roomId) {
            router.push(`/chat/${data.roomId}`);
          }
          break;
        case 'request':
          if (data.requestId) {
            router.push(`/request/${data.requestId}`);
          }
          break;
        case 'matching':
          if (data.requestId) {
            router.push(`/request/${data.requestId}`);
          }
          break;
        case 'payment':
          router.push('/(tabs)/profile');
          break;
        default:
          router.push('/(tabs)');
      }
    },
    [router]
  );

  // 로컬 알림 발송 (테스트/Mock용)
  const sendLocalNotification = useCallback(
    async (
      title: string,
      body: string,
      data?: Record<string, unknown>,
      channelId: string = 'default'
    ) => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
        },
        trigger: null, // 즉시 발송
      });
    },
    []
  );

  // 예약 알림 발송
  const scheduleNotification = useCallback(
    async (
      title: string,
      body: string,
      triggerDate: Date,
      data?: Record<string, unknown>
    ) => {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });

      return identifier;
    },
    []
  );

  // 예약된 알림 취소
  const cancelNotification = useCallback(async (identifier: string) => {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }, []);

  // 모든 알림 취소
  const cancelAllNotifications = useCallback(async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }, []);

  // 뱃지 수 설정 (iOS)
  const setBadgeCount = useCallback(async (count: number) => {
    await Notifications.setBadgeCountAsync(count);
  }, []);

  // 알림 테스트 (Mock)
  const sendTestNotification = useCallback(
    (type: 'chat' | 'request' | 'matching' | 'payment') => {
      const notifications = {
        chat: {
          title: '새 메시지',
          body: '김순자: 네, 곧 도착해요!',
          data: { type: 'chat', roomId: 'chat-001' },
        },
        request: {
          title: '새 요청',
          body: '역삼동에서 육아 도움 요청이 들어왔어요.',
          data: { type: 'request', requestId: 'req-001' },
        },
        matching: {
          title: '매칭 완료!',
          body: '김순자님과 매칭되었습니다.',
          data: { type: 'matching', requestId: 'req-001' },
        },
        payment: {
          title: '결제 완료',
          body: '1,200원이 결제되었습니다.',
          data: { type: 'payment' },
        },
      };

      const notif = notifications[type];
      sendLocalNotification(notif.title, notif.body, notif.data);
    },
    [sendLocalNotification]
  );

  return {
    // 상태
    expoPushToken,
    hasPermission,

    // 권한 요청
    requestPermission: registerForPushNotifications,

    // 알림 발송
    sendLocalNotification,
    scheduleNotification,

    // 알림 관리
    cancelNotification,
    cancelAllNotifications,
    setBadgeCount,

    // 테스트
    sendTestNotification,
  };
};

/**
 * 알림 설정 훅
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

interface NotificationSettingsType {
  newRequest: boolean;
  matching: boolean;
  chat: boolean;
  payment: boolean;
  marketing: boolean;
}

const defaultSettings: NotificationSettingsType = {
  newRequest: true,
  matching: true,
  chat: true,
  payment: true,
  marketing: false,
};

export const useNotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSettingsType>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // 설정 로드
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
        if (stored) {
          setSettings({ ...defaultSettings, ...JSON.parse(stored) });
        }
      } catch (error) {
        console.error('알림 설정 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  // 설정 저장
  const saveSettings = useCallback(async (newSettings: NotificationSettingsType) => {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
      // Mock: 서버 동기화
      await new Promise((r) => setTimeout(r, 200));
    } catch (error) {
      console.error('알림 설정 저장 실패:', error);
    }
  }, []);

  // 설정 변경
  const updateSetting = useCallback(
    (key: keyof NotificationSettingsType, value: boolean) => {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      saveSettings(newSettings);
    },
    [settings, saveSettings]
  );

  // 전체 설정 변경
  const updateAllSettings = useCallback(
    (newSettings: Partial<NotificationSettingsType>) => {
      const merged = { ...settings, ...newSettings };
      setSettings(merged);
      saveSettings(merged);
    },
    [settings, saveSettings]
  );

  // 초기화
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    saveSettings(defaultSettings);
  }, [saveSettings]);

  return {
    settings,
    isLoading,
    updateSetting,
    updateAllSettings,
    resetSettings,
  };
};
