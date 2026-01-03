import {
  BASE_PRICE_TABLE,
  DIFFICULTY_MULTIPLIER,
  DEMAND_MULTIPLIER,
  SPECIAL_ADJUSTMENTS,
  DISTANCE_FEE_PER_500M,
} from '@/constants/prices';
import type { ServiceCategory, PriceResult } from '@/types';

interface PriceCalculationInput {
  category: ServiceCategory;
  subcategory: string;
  distanceMeters?: number;
  scheduledAt?: Date;
  urgency?: 'immediate' | 'soon' | 'normal';
  isRegular?: boolean;
  regularCount?: number;
}

/**
 * AI 기반 가격 책정 함수 (프론트엔드 Mock)
 */
export function calculatePrice(input: PriceCalculationInput): PriceResult {
  const {
    category,
    subcategory,
    distanceMeters = 0,
    scheduledAt,
    urgency = 'normal',
    isRegular = false,
    regularCount = 0,
  } = input;

  // 1. 기본가 조회
  const categoryPrices = BASE_PRICE_TABLE[category as keyof typeof BASE_PRICE_TABLE];
  const basePrice = categoryPrices?.[subcategory as keyof typeof categoryPrices] || 1000;

  // 2. 난이도 계수 (기본값: normal)
  const difficultyMultiplier = DIFFICULTY_MULTIPLIER.normal;

  // 3. 거리비 계산
  const distanceFee = Math.floor(distanceMeters / 500) * DISTANCE_FEE_PER_500M;

  // 4. 수요 계수 (시간대 기반)
  let demandMultiplier = DEMAND_MULTIPLIER.normal;
  if (scheduledAt) {
    const hour = scheduledAt.getHours();
    // 출퇴근 시간대 (7-9시, 17-19시) 높은 수요
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      demandMultiplier = DEMAND_MULTIPLIER.high;
    }
    // 심야 시간대 (22-6시) 낮은 수요
    else if (hour >= 22 || hour < 6) {
      demandMultiplier = DEMAND_MULTIPLIER.low;
    }
  }

  // 5. 특수 조건 확인
  const specialAdjustments: { name: string; value: number }[] = [];
  let totalMultiplier = 1;

  // 긴급 요청
  if (urgency === 'immediate') {
    specialAdjustments.push({ name: '긴급 (30분 내)', value: SPECIAL_ADJUSTMENTS.urgent_30min });
    totalMultiplier *= SPECIAL_ADJUSTMENTS.urgent_30min;
  } else if (urgency === 'soon') {
    specialAdjustments.push({ name: '긴급 (1시간 내)', value: SPECIAL_ADJUSTMENTS.urgent_1hr });
    totalMultiplier *= SPECIAL_ADJUSTMENTS.urgent_1hr;
  }

  // 야간 (21시 이후)
  if (scheduledAt) {
    const hour = scheduledAt.getHours();
    if (hour >= 21 || hour < 6) {
      specialAdjustments.push({ name: '야간 할증', value: SPECIAL_ADJUSTMENTS.night });
      totalMultiplier *= SPECIAL_ADJUSTMENTS.night;
    }

    // 주말/공휴일
    const dayOfWeek = scheduledAt.getDay();
    if (dayOfWeek === 6) {
      specialAdjustments.push({ name: '토요일', value: SPECIAL_ADJUSTMENTS.saturday });
      totalMultiplier *= SPECIAL_ADJUSTMENTS.saturday;
    } else if (dayOfWeek === 0) {
      specialAdjustments.push({ name: '일요일/공휴일', value: SPECIAL_ADJUSTMENTS.sunday_holiday });
      totalMultiplier *= SPECIAL_ADJUSTMENTS.sunday_holiday;
    }
  }

  // 정기 요청 할인
  if (isRegular) {
    specialAdjustments.push({ name: '정기 요청 할인', value: SPECIAL_ADJUSTMENTS.regular_discount });
    totalMultiplier *= SPECIAL_ADJUSTMENTS.regular_discount;
  }

  // 단골 할인
  if (regularCount >= 5) {
    specialAdjustments.push({ name: '단골 할인', value: SPECIAL_ADJUSTMENTS.regular_5plus });
    totalMultiplier *= SPECIAL_ADJUSTMENTS.regular_5plus;
  }

  // 6. 최종 가격 계산
  let price = basePrice * difficultyMultiplier * demandMultiplier * totalMultiplier;
  price += distanceFee;

  // 100원 단위 반올림
  const finalPrice = Math.round(price / 100) * 100;

  return {
    price: finalPrice,
    breakdown: {
      basePrice,
      difficulty: difficultyMultiplier,
      demand: demandMultiplier,
      distanceFee,
      specialAdjustments,
    },
  };
}

/**
 * 자연어에서 카테고리와 서브카테고리 추출 (간단한 키워드 매칭)
 */
export function analyzeRequestText(text: string): {
  category?: ServiceCategory;
  subcategory?: string;
  estimatedDuration?: number;
} {
  const lowerText = text.toLowerCase();

  // 육아/돌봄
  if (lowerText.includes('어린이집') || lowerText.includes('등원') || lowerText.includes('하원')) {
    if (lowerText.includes('대기')) {
      return { category: 'childcare', subcategory: 'pickup_wait', estimatedDuration: 5 };
    }
    if (lowerText.includes('데려다') || lowerText.includes('등원')) {
      return { category: 'childcare', subcategory: 'dropoff', estimatedDuration: 15 };
    }
    if (lowerText.includes('데려오') || lowerText.includes('하원')) {
      return { category: 'childcare', subcategory: 'pickup', estimatedDuration: 15 };
    }
  }

  if (lowerText.includes('놀이터') || lowerText.includes('봐주') || lowerText.includes('돌봄')) {
    if (lowerText.includes('30분')) {
      return { category: 'childcare', subcategory: 'playground_watch', estimatedDuration: 30 };
    }
    if (lowerText.includes('1시간') || lowerText.includes('한시간')) {
      return { category: 'childcare', subcategory: 'home_care_1hr', estimatedDuration: 60 };
    }
    return { category: 'childcare', subcategory: 'home_care_30min', estimatedDuration: 30 };
  }

  if (lowerText.includes('숙제')) {
    return { category: 'childcare', subcategory: 'homework_help', estimatedDuration: 30 };
  }

  // 음식/가사
  if (lowerText.includes('반찬')) {
    if (lowerText.includes('3') || lowerText.includes('세트')) {
      return { category: 'housework', subcategory: 'side_dish_3', estimatedDuration: 60 };
    }
    return { category: 'housework', subcategory: 'side_dish_1', estimatedDuration: 30 };
  }

  if (lowerText.includes('청소')) {
    return { category: 'housework', subcategory: 'cleaning_30min', estimatedDuration: 30 };
  }

  if (lowerText.includes('빨래') || lowerText.includes('개키')) {
    return { category: 'housework', subcategory: 'laundry_fold', estimatedDuration: 15 };
  }

  // 심부름
  if (lowerText.includes('택배')) {
    return { category: 'errand', subcategory: 'package_receive', estimatedDuration: 5 };
  }

  if (lowerText.includes('분리수거')) {
    return { category: 'errand', subcategory: 'recycling', estimatedDuration: 10 };
  }

  if (lowerText.includes('편의점') || lowerText.includes('사오')) {
    return { category: 'errand', subcategory: 'convenience_store', estimatedDuration: 15 };
  }

  if (lowerText.includes('장보기') || lowerText.includes('마트')) {
    return { category: 'errand', subcategory: 'grocery_shopping', estimatedDuration: 60 };
  }

  // 디지털 도움
  if (lowerText.includes('앱') && (lowerText.includes('설치') || lowerText.includes('설명'))) {
    return { category: 'digital_help', subcategory: 'app_install', estimatedDuration: 10 };
  }

  if (lowerText.includes('카카오') || lowerText.includes('카톡')) {
    return { category: 'digital_help', subcategory: 'kakaotalk', estimatedDuration: 15 };
  }

  if (lowerText.includes('키오스크') || lowerText.includes('무인')) {
    return { category: 'digital_help', subcategory: 'kiosk_help', estimatedDuration: 10 };
  }

  if (lowerText.includes('스마트폰') || lowerText.includes('핸드폰')) {
    return { category: 'digital_help', subcategory: 'phone_setup', estimatedDuration: 30 };
  }

  // 이동 지원
  if (lowerText.includes('병원') && lowerText.includes('동행')) {
    return { category: 'mobility', subcategory: 'hospital_accompany', estimatedDuration: 120 };
  }

  if (lowerText.includes('은행') && lowerText.includes('동행')) {
    return { category: 'mobility', subcategory: 'bank_accompany', estimatedDuration: 60 };
  }

  // 육체 노동
  if (lowerText.includes('짐') || lowerText.includes('옮기')) {
    return { category: 'physical_help', subcategory: 'heavy_item_1', estimatedDuration: 10 };
  }

  if (lowerText.includes('가구')) {
    return { category: 'physical_help', subcategory: 'furniture_move', estimatedDuration: 30 };
  }

  // 상담/멘토링
  if (lowerText.includes('상담') || lowerText.includes('조언')) {
    if (lowerText.includes('진로') || lowerText.includes('커리어')) {
      return { category: 'consultation', subcategory: 'career_15min', estimatedDuration: 15 };
    }
    return { category: 'consultation', subcategory: 'quick_advice', estimatedDuration: 5 };
  }

  if (lowerText.includes('이력서') || lowerText.includes('자소서')) {
    return { category: 'consultation', subcategory: 'resume_review', estimatedDuration: 30 };
  }

  // 기본값
  return {};
}
