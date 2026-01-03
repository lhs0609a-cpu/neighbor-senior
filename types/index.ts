// 사용자 관련 타입
export interface User {
  id: string;
  phone: string;
  name: string;
  nickname?: string;
  birthDate: string;
  gender?: 'male' | 'female';
  profileImageUrl?: string;
  introduction?: string;
  isRequester: boolean;
  isProvider: boolean;
  address: {
    sido: string;
    sigungu: string;
    dong: string;
    detail?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  cashBalance: number;
  pointBalance: number;
  status: 'active' | 'suspended' | 'withdrawn';
  createdAt: string;
}

// 제공자 프로필
export interface ProviderProfile {
  id: string;
  userId: string;
  verificationStatus: 'pending' | 'document_submitted' | 'interview_scheduled' | 'interview_done' | 'approved' | 'rejected';
  level: 1 | 2 | 3 | 4; // 1: 신규, 2: 인증, 3: 베테랑, 4: 마스터
  totalCompletions: number;
  averageRating: number;
  totalReviews: number;
  recommendationCount: number;
  isActive: boolean;
  activeRadiusKm: number;
  services: ProviderService[];
  availability: ProviderAvailability[];
}

export interface ProviderService {
  category: ServiceCategory;
  subcategory: string;
  isActive: boolean;
}

export interface ProviderAvailability {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string; // HH:mm
  endTime: string;
  isActive: boolean;
}

// 서비스 카테고리
export type ServiceCategory =
  | 'childcare'    // 육아/돌봄
  | 'housework'    // 음식/가사
  | 'errand'       // 심부름
  | 'consultation' // 상담/멘토링
  | 'digital_help' // 디지털 도움
  | 'mobility'     // 이동 지원
  | 'physical_help'// 육체 노동
  | 'health'       // 건강 관리
  | 'memory';      // 추억 디지털화

// 요청 관련 타입
export interface ServiceRequest {
  id: string;
  requesterId: string;
  category: ServiceCategory;
  subcategory?: string;
  title?: string;
  description: string;
  originalText?: string;
  aiAnalysis?: {
    parsedTask: string;
    estimatedDuration: number;
    difficulty: 'simple' | 'normal' | 'complex';
  };
  pricing: {
    basePrice: number;
    distanceFee: number;
    demandMultiplier: number;
    specialAdjustments: { type: string; multiplier: number }[];
    finalPrice: number;
  };
  requestType: 'immediate' | 'scheduled';
  scheduledAt?: string;
  urgency: 'immediate' | 'soon' | 'normal';
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  destination?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  distanceMeters?: number;
  status: RequestStatus;
  providerId?: string;
  provider?: User;
  matchedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: 'cash' | 'point' | 'hybrid';
  cashAmount?: number;
  pointAmount?: number;
  createdAt: string;
}

export type RequestStatus =
  | 'pending'     // 대기중
  | 'matching'    // 매칭중
  | 'matched'     // 매칭완료
  | 'in_progress' // 진행중
  | 'completed'   // 완료
  | 'cancelled'   // 취소
  | 'disputed';   // 분쟁

// 가격 계산 결과
export interface PriceResult {
  price: number;
  breakdown: {
    basePrice: number;
    difficulty: number;
    demand: number;
    distanceFee: number;
    specialAdjustments: { name: string; value: number }[];
  };
}

// 채팅 관련
export interface ChatRoom {
  id: string;
  requestId: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'location';
  readAt?: string;
  createdAt: string;
}

// 리뷰
export interface Review {
  id: string;
  requestId: string;
  reviewerId: string;
  revieweeId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  content?: string;
  createdAt: string;
}

// 알림
export interface Notification {
  id: string;
  userId: string;
  type: 'request' | 'matching' | 'chat' | 'payment' | 'system';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  readAt?: string;
  createdAt: string;
}
