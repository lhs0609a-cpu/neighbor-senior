/**
 * 푸시 알림 관련 커스텀 훅
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores';

/**
 * 푸시 알림 훅
 */
export const useNotifications = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  // 푸시 토큰 등록
  const registerForPushNotifications = useCallback(async () => {
    // 웹에서는 알림 지원 안함
    if (Platform.OS === 'web') {
      console.log('웹에서는 푸시 알림이 지원되지 않습니다');
      return null;
    }

    try {
      const Notifications = require('expo-notifications');
      const Device = require('expo-device');

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
      const pushToken = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });
      setExpoPushToken(pushToken.data);

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

      return pushToken.data;
    } catch (error) {
      console.error('푸시 토큰 등록 실패:', error);
      return null;
    }
  }, []);

  // 알림 클릭 처리
  const handleNotificationPress = useCallback(
    (data: Record<string, unknown>) => {
      const type = data.type as string;

      switch (type) {
        case 'chat':
          if (data.roomId) {
            router.push(`/chat/${data.roomId}`);
          }
          break;
        case 'request':
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

  // 알림 설정 초기화
  useEffect(() => {
    if (Platform.OS === 'web') return;

    registerForPushNotifications();

    try {
      const Notifications = require('expo-notifications');

      // 알림 핸들러 설정
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        }),
      });

      // 알림 수신 리스너
      notificationListener.current = Notifications.addNotificationReceivedListener(
        (notification: any) => {
          console.log('알림 수신:', notification);
        }
      );

      // 알림 클릭 리스너
      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        (response: any) => {
          const data = response.notification.request.content.data;
          handleNotificationPress(data);
        }
      );
    } catch (error) {
      console.error('알림 리스너 설정 실패:', error);
    }

    return () => {
      if (Platform.OS === 'web') return;

      try {
        const Notifications = require('expo-notifications');
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(notificationListener.current);
        }
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(responseListener.current);
        }
      } catch (error) {
        console.error('알림 리스너 제거 실패:', error);
      }
    };
  }, [registerForPushNotifications, handleNotificationPress]);

  // 로컬 알림 발송
  const sendLocalNotification = useCallback(
    async (
      title: string,
      body: string,
      data?: Record<string, unknown>,
      channelId: string = 'default'
    ) => {
      if (Platform.OS === 'web') {
        console.log('웹 알림:', { title, body });
        return;
      }

      try {
        const Notifications = require('expo-notifications');
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: data || {},
            sound: true,
          },
          trigger: null,
        });
      } catch (error) {
        console.error('알림 발송 실패:', error);
      }
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
      if (Platform.OS === 'web') {
        console.log('웹 예약 알림:', { title, body, triggerDate });
        return null;
      }

      try {
        const Notifications = require('expo-notifications');
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
      } catch (error) {
        console.error('예약 알림 실패:', error);
        return null;
      }
    },
    []
  );

  // 예약된 알림 취소
  const cancelNotification = useCallback(async (identifier: string) => {
    if (Platform.OS === 'web') return;

    try {
      const Notifications = require('expo-notifications');
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('알림 취소 실패:', error);
    }
  }, []);

  // 모든 알림 취소
  const cancelAllNotifications = useCallback(async () => {
    if (Platform.OS === 'web') return;

    try {
      const Notifications = require('expo-notifications');
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('전체 알림 취소 실패:', error);
    }
  }, []);

  // 뱃지 수 설정
  const setBadgeCount = useCallback(async (count: number) => {
    if (Platform.OS === 'web') return;

    try {
      const Notifications = require('expo-notifications');
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('뱃지 설정 실패:', error);
    }
  }, []);

  // 알림 테스트
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
    expoPushToken,
    hasPermission,
    requestPermission: registerForPushNotifications,
    sendLocalNotification,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    setBadgeCount,
    sendTestNotification,
  };
};

/**
 * 알림 설정 훅
 */
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

const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

export const useNotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSettingsType>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // 설정 로드
  useEffect(() => {
    const loadSettings = async () => {
      try {
        if (Platform.OS === 'web') {
          // 웹에서는 localStorage 사용
          const stored = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
          if (stored) {
            setSettings({ ...defaultSettings, ...JSON.parse(stored) });
          }
        } else {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
          if (stored) {
            setSettings({ ...defaultSettings, ...JSON.parse(stored) });
          }
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
      if (Platform.OS === 'web') {
        localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
      } else {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
      }
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
