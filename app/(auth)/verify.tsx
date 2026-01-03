import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/stores';
import { Button } from '@/components/ui';

export default function VerifyScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { login } = useAuthStore();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(180); // 3분
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // 타이머
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (text: string, index: number) => {
    // 숫자만 허용
    const digit = text.replace(/\D/g, '').slice(-1);

    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError('');

    // 다음 입력칸으로 이동
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // 모든 코드 입력 완료 시 자동 검증
    if (digit && index === 5) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        verifyCode(fullCode);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (fullCode: string) => {
    setIsLoading(true);
    try {
      // Mock 인증 - 실제로는 서버 검증
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock: 6자리 숫자 코드면 성공 처리
      // 실제 구현 시 서버에서 검증
      const isValidCode = /^\d{6}$/.test(fullCode);

      if (isValidCode) {
        // Mock 사용자 데이터 (실제로는 서버에서 반환)
        const mockUser = {
          id: `user-${Date.now()}`,
          phone: phone || '010-0000-0000',
          name: '사용자',
          birthDate: '1990-01-01',
          isRequester: true,
          isProvider: false,
          address: {
            sido: '서울특별시',
            sigungu: '강남구',
            dong: '역삼동',
          },
          cashBalance: 10000,
          pointBalance: 1.0,
          status: 'active' as const,
          createdAt: new Date().toISOString(),
        };

        login(mockUser, `token-${Date.now()}`);
        router.replace('/(tabs)');
      } else {
        setError('인증번호가 올바르지 않습니다');
      }
    } catch (err) {
      setError('인증에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      // Mock API 호출 - 실제로는 SMS 재전송 API
      await new Promise((resolve) => setTimeout(resolve, 500));

      setTimer(180);
      setCode(['', '', '', '', '', '']);
      setError('');
      inputRefs.current[0]?.focus();

      Alert.alert('전송 완료', '인증번호가 재전송되었습니다.');
    } catch (err) {
      Alert.alert('오류', '인증번호 재전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-12">
        {/* 뒤로가기 */}
        <TouchableOpacity onPress={() => router.back()} className="mb-8">
          <Text className="text-gray-500">← 뒤로</Text>
        </TouchableOpacity>

        {/* 타이틀 */}
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            인증번호 입력
          </Text>
          <Text className="text-gray-500">
            {phone}로 전송된 6자리 코드를 입력하세요
          </Text>
        </View>

        {/* 인증번호 입력 */}
        <View className="flex-row justify-between mb-4">
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              className={`
                w-12 h-14 border-2 rounded-xl text-center text-2xl font-bold
                ${error ? 'border-red-500' : digit ? 'border-primary-500' : 'border-gray-300'}
              `}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* 에러 메시지 */}
        {error && (
          <Text className="text-red-500 text-center mb-4">{error}</Text>
        )}

        {/* 타이머 및 재전송 */}
        <View className="flex-row justify-center items-center mb-8">
          {timer > 0 ? (
            <Text className="text-gray-500">
              남은 시간: <Text className="text-primary-600 font-semibold">{formatTime(timer)}</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text className="text-primary-600 font-semibold">인증번호 재전송</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 확인 버튼 */}
        <Button
          title="확인"
          fullWidth
          size="lg"
          loading={isLoading}
          disabled={code.some((d) => !d)}
          onPress={() => verifyCode(code.join(''))}
        />

        {/* 도움말 */}
        <View className="mt-8 bg-gray-50 rounded-xl p-4">
          <Text className="text-gray-600 text-sm">
            💡 인증번호가 오지 않나요?
          </Text>
          <Text className="text-gray-500 text-sm mt-1">
            • 스팸 문자함을 확인해주세요{'\n'}
            • 휴대폰 번호가 맞는지 확인해주세요{'\n'}
            • 3분 후 재전송을 시도해주세요
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
