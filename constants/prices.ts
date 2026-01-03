// AI 가격 책정 시스템 - 기본가 테이블

export const BASE_PRICE_TABLE = {
  childcare: {
    pickup_wait: 500,        // 어린이집 픽업 대기 (5분)
    dropoff: 1000,           // 등원 데려다주기
    pickup: 1000,            // 하원 데려오기
    playground_watch: 2000,  // 놀이터 봐주기 (30분)
    home_care_30min: 2000,   // 집에서 돌봄 (30분)
    home_care_1hr: 4000,     // 집에서 돌봄 (1시간)
    homework_help: 1500,     // 숙제 봐주기 (30분)
    bedtime_bath: 3000,      // 재우기/목욕
    hospital_accompany: 8000, // 병원 동행 (2시간)
  },
  housework: {
    side_dish_1: 1500,       // 반찬 1가지
    side_dish_3: 3500,       // 반찬 3종 세트
    dinner_2person: 5000,    // 저녁 한 끼 (2인분)
    kimchi_making: 15000,    // 김장 담그기 (반나절)
    laundry_fold: 800,       // 빨래 개켜주기
    ironing_10: 1500,        // 다림질 (10벌)
    cleaning_30min: 2000,    // 간단한 청소 (30분)
    organizing_1hr: 3500,    // 정리정돈 (1시간)
  },
  errand: {
    package_receive: 300,    // 택배 대신 받기
    recycling: 400,          // 분리수거
    convenience_store: 500,  // 편의점 물건 사오기
    office_document: 800,    // 관공서 서류 제출
    queue_waiting: 1000,     // 번호표 대기
    grocery_shopping: 2000,  // 장보기 대행
  },
  digital_help: {
    app_install: 300,        // 앱 설치/설명
    kakaotalk: 500,          // 카카오톡 기능
    kiosk_help: 400,         // 키오스크 주문 동행
    phone_setup: 1000,       // 스마트폰 기본 세팅
    streaming_setup: 800,    // 유튜브/넷플릭스 설정
    video_call_setup: 600,   // 영상통화 설정
    security_app: 500,       // 보이스피싱 예방 앱
    photo_backup: 1500,      // 사진 정리/백업
  },
  mobility: {
    hospital_accompany: 5000, // 병원 동행 (2시간)
    shopping_accompany: 1500, // 장보기 동행
    office_accompany: 2000,   // 관공서 동행
    bank_accompany: 1500,     // 은행 동행
  },
  physical_help: {
    heavy_item_1: 500,       // 무거운 짐 옮기기 (1개)
    high_reach: 300,         // 높은 곳 물건 꺼내기
    furniture_move: 2000,    // 가구 이동/조립
    multiple_items: 1500,    // 짐 운반 (5개 이상)
  },
  health: {
    checkup_reservation: 500, // 건강검진 예약
    medicine_app: 800,        // 약 복용 앱 설정
    walk_accompany: 1000,     // 산책 동행 (30분)
    health_app: 600,          // 건강 앱 관리
  },
  memory: {
    photo_scan_10: 1500,     // 오래된 사진 스캔 (10장)
    album_create: 3000,      // 사진 앨범 제작
    video_edit_5min: 5000,   // 영상 편집 (5분)
  },
  consultation: {
    quick_advice: 500,       // 5분 간단 조언
    career_15min: 1500,      // 15분 진로 상담
    deep_talk_30min: 2500,   // 30분 깊은 대화
    resume_review: 3000,     // 이력서/자소서 피드백
    interview_coaching: 4000, // 면접 코칭 (30분)
    life_advice: 2000,       // 결혼/육아 조언
  },
} as const;

// 난이도 계수
export const DIFFICULTY_MULTIPLIER = {
  simple: 1.0,
  normal: 1.5,
  complex: 2.0,
} as const;

// 소요시간 계수
export const DURATION_MULTIPLIER = {
  5: 1.0,   // 5분 이내
  15: 2.0,  // 15분
  30: 3.0,  // 30분
  60: 5.0,  // 1시간
} as const;

// 수요 계수
export const DEMAND_MULTIPLIER = {
  low: 0.9,    // 한산
  normal: 1.0, // 보통
  high: 1.2,   // 바쁨
} as const;

// 특수 조건 조정
export const SPECIAL_ADJUSTMENTS = {
  weather_bad: 1.2,      // 비/눈/폭염
  urgent_30min: 1.3,     // 긴급 (30분 내)
  urgent_1hr: 1.15,      // 긴급 (1시간 내)
  night: 1.2,            // 야간 (21시 이후)
  saturday: 1.1,         // 토요일
  sunday_holiday: 1.2,   // 일요일/공휴일
  regular_discount: 0.85, // 정기 요청 할인
  regular_5plus: 0.9,    // 단골 매칭 (5회+)
} as const;

// 거리비 (500m당)
export const DISTANCE_FEE_PER_500M = 100;

// 카테고리 한글명
export const CATEGORY_NAMES: Record<string, string> = {
  childcare: '육아/돌봄',
  housework: '음식/가사',
  errand: '심부름',
  digital_help: '디지털 도움',
  mobility: '이동 지원',
  physical_help: '육체 노동',
  health: '건강 관리',
  memory: '추억 디지털화',
  consultation: '상담/멘토링',
};

// 카테고리 아이콘 (이모지)
export const CATEGORY_ICONS: Record<string, string> = {
  childcare: '👶',
  housework: '🍲',
  errand: '📦',
  digital_help: '📱',
  mobility: '🚗',
  physical_help: '💪',
  health: '🏥',
  memory: '📷',
  consultation: '💬',
};
