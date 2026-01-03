import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRequestStore } from '@/stores';
import { Button, Card, CategoryGrid } from '@/components/ui';
import { CATEGORY_NAMES, CATEGORY_ICONS, BASE_PRICE_TABLE } from '@/constants/prices';
import { calculatePrice, analyzeRequestText } from '@/utils/priceCalculator';
import type { ServiceCategory, PriceResult } from '@/types';

type Urgency = 'immediate' | 'soon' | 'normal';

const URGENCY_OPTIONS: { value: Urgency; label: string; description: string }[] = [
  { value: 'normal', label: '일반', description: '시간 여유 있음' },
  { value: 'soon', label: '빠른 매칭', description: '1시간 내 (+15%)' },
  { value: 'immediate', label: '긴급', description: '30분 내 (+30%)' },
];

export default function CreateRequestScreen() {
  const router = useRouter();
  const { draft, updateDraft, priceResult, setPriceResult, isCalculating, setCalculating, resetDraft } = useRequestStore();

  const [step, setStep] = useState(1); // 1: 카테고리, 2: 상세, 3: 확인
  const [subcategory, setSubcategory] = useState<string>('');

  // 텍스트 입력 시 AI 분석
  useEffect(() => {
    if (draft.description.length > 5) {
      const timer = setTimeout(() => {
        setCalculating(true);
        const analysis = analyzeRequestText(draft.description);
        if (analysis.category) {
          updateDraft({ category: analysis.category });
          if (analysis.subcategory) {
            setSubcategory(analysis.subcategory);
          }
        }

        // 가격 계산
        if (analysis.category && analysis.subcategory) {
          const result = calculatePrice({
            category: analysis.category,
            subcategory: analysis.subcategory,
            urgency: draft.urgency,
            scheduledAt: draft.scheduledAt ? new Date(draft.scheduledAt) : undefined,
          });
          setPriceResult(result);
        }
        setCalculating(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [draft.description]);

  // 카테고리 변경 시 가격 재계산
  useEffect(() => {
    if (draft.category && subcategory) {
      const result = calculatePrice({
        category: draft.category,
        subcategory,
        urgency: draft.urgency,
        scheduledAt: draft.scheduledAt ? new Date(draft.scheduledAt) : undefined,
      });
      setPriceResult(result);
    }
  }, [draft.category, subcategory, draft.urgency]);

  const handleCategorySelect = (category: ServiceCategory) => {
    updateDraft({ category });
    // 첫 번째 서브카테고리를 기본값으로
    const subcats = Object.keys(BASE_PRICE_TABLE[category as keyof typeof BASE_PRICE_TABLE] || {});
    if (subcats.length > 0) {
      setSubcategory(subcats[0]);
    }
    setStep(2);
  };

  const handleSubmit = () => {
    // 요청 제출 로직
    console.log('Request submitted:', { ...draft, subcategory, priceResult });
    router.push('/request/matching');
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      resetDraft();
      router.back();
    }
  };

  // 서브카테고리 옵션 가져오기
  const getSubcategoryOptions = () => {
    if (!draft.category) return [];
    const subcats = BASE_PRICE_TABLE[draft.category as keyof typeof BASE_PRICE_TABLE];
    if (!subcats) return [];

    const SUBCATEGORY_NAMES: Record<string, string> = {
      pickup_wait: '픽업 대기 (5분)',
      dropoff: '등원 데려다주기',
      pickup: '하원 데려오기',
      playground_watch: '놀이터 봐주기 (30분)',
      home_care_30min: '집에서 돌봄 (30분)',
      home_care_1hr: '집에서 돌봄 (1시간)',
      homework_help: '숙제 봐주기',
      bedtime_bath: '재우기/목욕',
      hospital_accompany: '병원 동행',
      side_dish_1: '반찬 1가지',
      side_dish_3: '반찬 3종 세트',
      dinner_2person: '저녁 한 끼 (2인분)',
      kimchi_making: '김장 담그기',
      laundry_fold: '빨래 개켜주기',
      ironing_10: '다림질 (10벌)',
      cleaning_30min: '간단한 청소 (30분)',
      organizing_1hr: '정리정돈 (1시간)',
      package_receive: '택배 받기',
      recycling: '분리수거',
      convenience_store: '편의점 심부름',
      office_document: '관공서 서류 제출',
      queue_waiting: '번호표 대기',
      grocery_shopping: '장보기',
      app_install: '앱 설치/설명',
      kakaotalk: '카카오톡 사용법',
      kiosk_help: '키오스크 도움',
      phone_setup: '스마트폰 세팅',
      streaming_setup: '유튜브/넷플릭스 설정',
      video_call_setup: '영상통화 설정',
      security_app: '보안 앱 설치',
      photo_backup: '사진 백업',
      heavy_item_1: '무거운 짐 옮기기',
      high_reach: '높은 곳 물건 꺼내기',
      furniture_move: '가구 이동/조립',
      multiple_items: '짐 여러 개 운반',
      quick_advice: '간단 조언 (5분)',
      career_15min: '진로 상담 (15분)',
      deep_talk_30min: '깊은 대화 (30분)',
      resume_review: '이력서 피드백',
      interview_coaching: '면접 코칭',
      life_advice: '인생 조언',
    };

    return Object.entries(subcats).map(([key, price]) => ({
      key,
      label: SUBCATEGORY_NAMES[key] || key,
      price: price as number,
    }));
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Step 1: 카테고리 선택 */}
        {step === 1 && (
          <View className="px-5 py-6">
            <Text className="text-xl font-bold text-gray-900 mb-2">
              어떤 도움이 필요하세요?
            </Text>
            <Text className="text-gray-500 mb-6">
              카테고리를 선택하거나 아래에 직접 입력하세요
            </Text>

            <CategoryGrid
              selectedCategory={draft.category}
              onSelectCategory={handleCategorySelect}
            />

            <View className="mt-8">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                또는 직접 입력
              </Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-900 min-h-[120px]"
                placeholder="예: 내일 아침 8시에 아이 어린이집 데려다줄 분 찾아요"
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                value={draft.description}
                onChangeText={(text) => updateDraft({ description: text })}
              />
              {isCalculating && (
                <View className="flex-row items-center mt-2">
                  <ActivityIndicator size="small" color="#4F46E5" />
                  <Text className="text-sm text-gray-500 ml-2">AI 분석 중...</Text>
                </View>
              )}
              {draft.category && (
                <View className="mt-3">
                  <Text className="text-sm text-primary-600">
                    감지된 카테고리: {CATEGORY_ICONS[draft.category]} {CATEGORY_NAMES[draft.category]}
                  </Text>
                </View>
              )}
            </View>

            {draft.description.length > 0 && (
              <Button
                title="다음"
                fullWidth
                className="mt-6"
                onPress={() => setStep(2)}
              />
            )}
          </View>
        )}

        {/* Step 2: 상세 설정 */}
        {step === 2 && (
          <View className="px-5 py-6">
            <View className="flex-row items-center mb-6">
              <Text className="text-2xl mr-2">
                {draft.category && CATEGORY_ICONS[draft.category]}
              </Text>
              <Text className="text-xl font-bold text-gray-900">
                {draft.category && CATEGORY_NAMES[draft.category]}
              </Text>
            </View>

            {/* 서브카테고리 선택 */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                세부 서비스
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {getSubcategoryOptions().map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() => setSubcategory(option.key)}
                    className={`
                      px-4 py-3 rounded-xl border
                      ${subcategory === option.key
                        ? 'bg-primary-100 border-primary-500'
                        : 'bg-white border-gray-200'
                      }
                    `}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        subcategory === option.key ? 'text-primary-700' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </Text>
                    <Text
                      className={`text-xs mt-0.5 ${
                        subcategory === option.key ? 'text-primary-600' : 'text-gray-500'
                      }`}
                    >
                      {option.price.toLocaleString()}원~
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 상세 설명 */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                상세 내용
              </Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-900 min-h-[100px]"
                placeholder="구체적인 요청 내용을 적어주세요"
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                value={draft.description}
                onChangeText={(text) => updateDraft({ description: text })}
              />
            </View>

            {/* 긴급도 선택 */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                희망 시간
              </Text>
              <View className="flex-row gap-2">
                {URGENCY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => updateDraft({ urgency: option.value })}
                    className={`
                      flex-1 px-3 py-3 rounded-xl border items-center
                      ${draft.urgency === option.value
                        ? 'bg-primary-100 border-primary-500'
                        : 'bg-white border-gray-200'
                      }
                    `}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        draft.urgency === option.value ? 'text-primary-700' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </Text>
                    <Text
                      className={`text-xs mt-0.5 ${
                        draft.urgency === option.value ? 'text-primary-600' : 'text-gray-500'
                      }`}
                    >
                      {option.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Button
              title="가격 확인"
              fullWidth
              disabled={!subcategory}
              onPress={() => setStep(3)}
            />
          </View>
        )}

        {/* Step 3: 가격 확인 및 요청 */}
        {step === 3 && priceResult && (
          <View className="px-5 py-6">
            <Text className="text-xl font-bold text-gray-900 mb-6">
              요청 내용 확인
            </Text>

            {/* 요청 요약 */}
            <Card variant="outlined" padding="lg" className="mb-6">
              <View className="flex-row items-center mb-4">
                <Text className="text-2xl mr-3">
                  {draft.category && CATEGORY_ICONS[draft.category]}
                </Text>
                <View>
                  <Text className="text-lg font-semibold text-gray-900">
                    {draft.category && CATEGORY_NAMES[draft.category]}
                  </Text>
                  <Text className="text-gray-500">
                    {URGENCY_OPTIONS.find((o) => o.value === draft.urgency)?.label}
                  </Text>
                </View>
              </View>
              <Text className="text-gray-700">{draft.description}</Text>
            </Card>

            {/* 가격 상세 */}
            <Card variant="elevated" padding="lg" className="mb-6">
              <Text className="text-sm text-gray-500 mb-2">예상 비용</Text>
              <Text className="text-3xl font-bold text-primary-600 mb-4">
                {priceResult.price.toLocaleString()}원
              </Text>

              <View className="border-t border-gray-100 pt-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-500">기본료</Text>
                  <Text className="text-gray-900">
                    {priceResult.breakdown.basePrice.toLocaleString()}원
                  </Text>
                </View>
                {priceResult.breakdown.distanceFee > 0 && (
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-500">거리비</Text>
                    <Text className="text-gray-900">
                      +{priceResult.breakdown.distanceFee.toLocaleString()}원
                    </Text>
                  </View>
                )}
                {priceResult.breakdown.demand !== 1.0 && (
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-500">수요 조정</Text>
                    <Text className="text-gray-900">
                      ×{priceResult.breakdown.demand.toFixed(1)}
                    </Text>
                  </View>
                )}
                {priceResult.breakdown.specialAdjustments.map((adj, index) => (
                  <View key={index} className="flex-row justify-between mb-2">
                    <Text className="text-gray-500">{adj.name}</Text>
                    <Text className={adj.value < 1 ? 'text-green-600' : 'text-gray-900'}>
                      {adj.value < 1 ? '-' : '+'}
                      {Math.abs((1 - adj.value) * 100).toFixed(0)}%
                    </Text>
                  </View>
                ))}
              </View>
            </Card>

            <View className="flex-row gap-3">
              <Button
                title="수정"
                variant="outline"
                className="flex-1"
                onPress={() => setStep(2)}
              />
              <Button
                title="요청 보내기"
                className="flex-1"
                onPress={handleSubmit}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* 하단 뒤로가기 */}
      {step > 1 && (
        <View className="px-5 py-4 bg-white border-t border-gray-200">
          <TouchableOpacity onPress={handleBack}>
            <Text className="text-center text-gray-500">← 이전 단계</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
