import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores';
import { Button, Input } from '@/components/ui';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const formatPhoneNumber = (text: string) => {
    // 숫자만 추출
    const numbers = text.replace(/\D/g, '');
    // 형식 적용 (010-1234-5678)
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (text: string) => {
    setPhone(formatPhoneNumber(text));
    setError('');
  };

  const handleLogin = async () => {
    const phoneNumbers = phone.replace(/\D/g, '');
    if (phoneNumbers.length !== 11) {
      setError('올바른 휴대폰 번호를 입력해주세요');
      return;
    }

    setIsLoading(true);
    try {
      // Mock 로그인 - 실제로는 인증 코드 전송
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 인증 화면으로 이동
      router.push({
        pathname: '/(auth)/verify',
        params: { phone },
      });
    } catch (err) {
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = () => {
    router.push('/(auth)/signup');
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert(
      `${provider} 로그인`,
      `${provider} 로그인 기능은 준비 중입니다.\n휴대폰 번호로 로그인해 주세요.`,
      [{ text: '확인' }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-12">
          {/* 로고 및 타이틀 */}
          <View className="items-center mb-12">
            <Text className="text-5xl mb-4">🏠</Text>
            <Text className="text-3xl font-bold text-gray-900">
              이웃집시니어
            </Text>
            <Text className="text-gray-500 mt-2">세대를 잇다</Text>
          </View>

          {/* 로그인 폼 */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              휴대폰 번호로 로그인
            </Text>

            <Input
              label="휴대폰 번호"
              placeholder="010-1234-5678"
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              maxLength={13}
              size="lg"
              error={error}
            />

            <Button
              title="인증번호 받기"
              fullWidth
              size="lg"
              loading={isLoading}
              disabled={phone.replace(/\D/g, '').length !== 11}
              onPress={handleLogin}
              className="mt-6"
            />
          </View>

          {/* 구분선 */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="px-4 text-gray-400">또는</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* 소셜 로그인 */}
          <View className="gap-3">
            <TouchableOpacity
              className="flex-row items-center justify-center bg-yellow-400 py-4 rounded-xl"
              onPress={() => handleSocialLogin('카카오')}
            >
              <Text className="text-lg font-semibold">카카오로 시작하기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-center bg-green-500 py-4 rounded-xl"
              onPress={() => handleSocialLogin('네이버')}
            >
              <Text className="text-lg font-semibold text-white">네이버로 시작하기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 하단 회원가입 */}
        <View className="px-6 py-6 border-t border-gray-100">
          <View className="flex-row justify-center items-center">
            <Text className="text-gray-500">처음이신가요?</Text>
            <TouchableOpacity onPress={handleSignup} className="ml-2">
              <Text className="text-primary-600 font-semibold">회원가입</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
