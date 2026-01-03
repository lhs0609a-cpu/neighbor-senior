import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, Input, Card } from '@/components/ui';

export default function SignupScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: 약관, 2: 정보, 3: 완료
  const [agreements, setAgreements] = useState({
    all: false,
    terms: false,
    privacy: false,
    location: false,
    marketing: false,
  });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birthYear: '',
    gender: '' as '' | 'male' | 'female',
    isProvider: false,
  });

  const toggleAgreement = (key: keyof typeof agreements) => {
    if (key === 'all') {
      const newValue = !agreements.all;
      setAgreements({
        all: newValue,
        terms: newValue,
        privacy: newValue,
        location: newValue,
        marketing: newValue,
      });
    } else {
      const newAgreements = { ...agreements, [key]: !agreements[key] };
      newAgreements.all = newAgreements.terms && newAgreements.privacy && newAgreements.location && newAgreements.marketing;
      setAgreements(newAgreements);
    }
  };

  const canProceedStep1 = agreements.terms && agreements.privacy && agreements.location;
  const canProceedStep2 = formData.name && formData.phone && formData.birthYear && formData.gender;

  const handleNext = () => {
    if (step === 1 && canProceedStep1) {
      setStep(2);
    } else if (step === 2 && canProceedStep2) {
      // 회원가입 API 호출
      setStep(3);
    }
  };

  const handleComplete = () => {
    router.replace('/(auth)/login');
  };

  // Step 1: 약관 동의
  if (step === 1) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 px-6 pt-8">
          <TouchableOpacity onPress={() => router.back()} className="mb-6">
            <Text className="text-gray-500">← 뒤로</Text>
          </TouchableOpacity>

          <Text className="text-2xl font-bold text-gray-900 mb-2">
            이웃집시니어 시작하기
          </Text>
          <Text className="text-gray-500 mb-8">
            서비스 이용을 위해 약관에 동의해주세요
          </Text>

          <ScrollView className="flex-1">
            {/* 전체 동의 */}
            <TouchableOpacity
              onPress={() => toggleAgreement('all')}
              className="flex-row items-center py-4 border-b border-gray-200"
            >
              <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${agreements.all ? 'bg-primary-600 border-primary-600' : 'border-gray-300'}`}>
                {agreements.all && <Text className="text-white text-xs">✓</Text>}
              </View>
              <Text className="text-lg font-semibold text-gray-900">전체 동의</Text>
            </TouchableOpacity>

            {/* 개별 항목 */}
            {[
              { key: 'terms', label: '서비스 이용약관', required: true },
              { key: 'privacy', label: '개인정보 처리방침', required: true },
              { key: 'location', label: '위치정보 이용약관', required: true },
              { key: 'marketing', label: '마케팅 정보 수신', required: false },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                onPress={() => toggleAgreement(item.key as keyof typeof agreements)}
                className="flex-row items-center justify-between py-4 border-b border-gray-100"
              >
                <View className="flex-row items-center">
                  <View className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${agreements[item.key as keyof typeof agreements] ? 'bg-primary-600 border-primary-600' : 'border-gray-300'}`}>
                    {agreements[item.key as keyof typeof agreements] && <Text className="text-white text-xs">✓</Text>}
                  </View>
                  <Text className="text-gray-700">
                    {item.required && <Text className="text-red-500">[필수] </Text>}
                    {item.label}
                  </Text>
                </View>
                <Text className="text-gray-400">›</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View className="py-6">
            <Button
              title="다음"
              fullWidth
              size="lg"
              disabled={!canProceedStep1}
              onPress={handleNext}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Step 2: 정보 입력
  if (step === 2) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1 px-6 pt-8">
          <TouchableOpacity onPress={() => setStep(1)} className="mb-6">
            <Text className="text-gray-500">← 뒤로</Text>
          </TouchableOpacity>

          <Text className="text-2xl font-bold text-gray-900 mb-2">
            기본 정보 입력
          </Text>
          <Text className="text-gray-500 mb-8">
            서비스 이용에 필요한 정보를 입력해주세요
          </Text>

          <View className="gap-6">
            <Input
              label="이름"
              placeholder="실명을 입력해주세요"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              size="lg"
            />

            <Input
              label="휴대폰 번호"
              placeholder="010-1234-5678"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
              size="lg"
            />

            <Input
              label="출생연도"
              placeholder="예: 1965"
              value={formData.birthYear}
              onChangeText={(text) => setFormData({ ...formData, birthYear: text })}
              keyboardType="number-pad"
              maxLength={4}
              size="lg"
            />

            <View>
              <Text className="text-base text-gray-700 mb-3 font-medium">성별</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setFormData({ ...formData, gender: 'male' })}
                  className={`flex-1 py-4 rounded-xl border-2 items-center ${formData.gender === 'male' ? 'bg-primary-100 border-primary-500' : 'border-gray-200'}`}
                >
                  <Text className={formData.gender === 'male' ? 'text-primary-700 font-semibold' : 'text-gray-700'}>
                    남성
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setFormData({ ...formData, gender: 'female' })}
                  className={`flex-1 py-4 rounded-xl border-2 items-center ${formData.gender === 'female' ? 'bg-primary-100 border-primary-500' : 'border-gray-200'}`}
                >
                  <Text className={formData.gender === 'female' ? 'text-primary-700 font-semibold' : 'text-gray-700'}>
                    여성
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 제공자 등록 옵션 */}
            <Card variant="outlined" padding="md">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-base font-semibold text-gray-900">
                    도움 제공자로도 등록할래요
                  </Text>
                  <Text className="text-sm text-gray-500 mt-1">
                    이웃에게 도움을 제공하고 수익을 얻을 수 있어요
                  </Text>
                </View>
                <Switch
                  value={formData.isProvider}
                  onValueChange={(value) => setFormData({ ...formData, isProvider: value })}
                  trackColor={{ false: '#E5E7EB', true: '#C7D2FE' }}
                  thumbColor={formData.isProvider ? '#4F46E5' : '#9CA3AF'}
                />
              </View>
            </Card>
          </View>
        </ScrollView>

        <View className="px-6 py-6">
          <Button
            title="가입 완료"
            fullWidth
            size="lg"
            disabled={!canProceedStep2}
            onPress={handleNext}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Step 3: 완료
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
          <Text className="text-5xl">🎉</Text>
        </View>

        <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
          환영합니다!
        </Text>
        <Text className="text-gray-500 text-center mb-8">
          이웃집시니어 가입이 완료되었어요{'\n'}
          지금 바로 이웃의 도움을 받아보세요
        </Text>

        <Button
          title="시작하기"
          fullWidth
          size="lg"
          onPress={handleComplete}
        />
      </View>
    </SafeAreaView>
  );
}
