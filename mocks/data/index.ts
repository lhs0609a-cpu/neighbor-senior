import type {
  User,
  ProviderProfile,
  ServiceRequest,
  ChatRoom,
  ChatMessage,
  Review,
  Notification,
} from '@/types';

// ============================================
// Mock 사용자 데이터
// ============================================

export const mockUsers: User[] = [
  // 현재 로그인 사용자 (요청자)
  {
    id: 'user-001',
    phone: '010-1234-5678',
    name: '홍길동',
    nickname: '길동이',
    birthDate: '1990-03-15',
    gender: 'male',
    profileImageUrl: undefined,
    introduction: '역삼동에 사는 직장인입니다. 가끔 도움이 필요해요!',
    isRequester: true,
    isProvider: false,
    address: {
      sido: '서울특별시',
      sigungu: '강남구',
      dong: '역삼동',
      detail: '123-45',
    },
    location: {
      latitude: 37.5000,
      longitude: 127.0367,
    },
    cashBalance: 8500,
    pointBalance: 2.5,
    status: 'active',
    createdAt: '2024-01-15T09:00:00Z',
  },
  // 시니어 제공자 1
  {
    id: 'provider-001',
    phone: '010-5678-1234',
    name: '김순자',
    nickname: '순자어머니',
    birthDate: '1957-05-20',
    gender: 'female',
    profileImageUrl: undefined,
    introduction: '30년 경력의 육아 전문가입니다. 아이들을 정말 좋아해요!',
    isRequester: false,
    isProvider: true,
    address: {
      sido: '서울특별시',
      sigungu: '강남구',
      dong: '역삼동',
    },
    location: {
      latitude: 37.4985,
      longitude: 127.0380,
    },
    cashBalance: 125000,
    pointBalance: 15.5,
    status: 'active',
    createdAt: '2023-06-01T09:00:00Z',
  },
  // 시니어 제공자 2
  {
    id: 'provider-002',
    phone: '010-9876-5432',
    name: '박영희',
    nickname: '영희선생님',
    birthDate: '1960-11-08',
    gender: 'female',
    profileImageUrl: undefined,
    introduction: '요리와 집안일을 잘합니다. 정성을 다해 도와드릴게요.',
    isRequester: false,
    isProvider: true,
    address: {
      sido: '서울특별시',
      sigungu: '강남구',
      dong: '삼성동',
    },
    location: {
      latitude: 37.5088,
      longitude: 127.0630,
    },
    cashBalance: 87000,
    pointBalance: 8.0,
    status: 'active',
    createdAt: '2023-08-15T09:00:00Z',
  },
  // 시니어 제공자 3
  {
    id: 'provider-003',
    phone: '010-1111-2222',
    name: '이정수',
    nickname: '정수아저씨',
    birthDate: '1962-02-14',
    gender: 'male',
    profileImageUrl: undefined,
    introduction: 'IT 회사 은퇴 후 디지털 도움을 드리고 있습니다.',
    isRequester: false,
    isProvider: true,
    address: {
      sido: '서울특별시',
      sigungu: '강남구',
      dong: '역삼동',
    },
    location: {
      latitude: 37.4995,
      longitude: 127.0350,
    },
    cashBalance: 45000,
    pointBalance: 5.0,
    status: 'active',
    createdAt: '2023-10-01T09:00:00Z',
  },
];

// ============================================
// Mock 제공자 프로필
// ============================================

export const mockProviderProfiles: ProviderProfile[] = [
  {
    id: 'profile-001',
    userId: 'provider-001',
    verificationStatus: 'approved',
    level: 3, // 베테랑
    totalCompletions: 128,
    averageRating: 4.9,
    totalReviews: 115,
    recommendationCount: 89,
    isActive: true,
    activeRadiusKm: 2,
    services: [
      { category: 'childcare', subcategory: 'pickup_dropoff', isActive: true },
      { category: 'childcare', subcategory: 'playground_watch', isActive: true },
      { category: 'childcare', subcategory: 'home_care_1h', isActive: true },
    ],
    availability: [
      { dayOfWeek: 1, startTime: '08:00', endTime: '18:00', isActive: true },
      { dayOfWeek: 2, startTime: '08:00', endTime: '18:00', isActive: true },
      { dayOfWeek: 3, startTime: '08:00', endTime: '18:00', isActive: true },
      { dayOfWeek: 4, startTime: '08:00', endTime: '18:00', isActive: true },
      { dayOfWeek: 5, startTime: '08:00', endTime: '18:00', isActive: true },
    ],
  },
  {
    id: 'profile-002',
    userId: 'provider-002',
    verificationStatus: 'approved',
    level: 2, // 인증
    totalCompletions: 45,
    averageRating: 4.7,
    totalReviews: 38,
    recommendationCount: 25,
    isActive: true,
    activeRadiusKm: 3,
    services: [
      { category: 'housework', subcategory: 'side_dish_3', isActive: true },
      { category: 'housework', subcategory: 'cleaning', isActive: true },
      { category: 'errand', subcategory: 'grocery_shopping', isActive: true },
    ],
    availability: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isActive: true },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isActive: true },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isActive: true },
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isActive: true },
      { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isActive: true },
      { dayOfWeek: 6, startTime: '10:00', endTime: '14:00', isActive: true },
    ],
  },
  {
    id: 'profile-003',
    userId: 'provider-003',
    verificationStatus: 'approved',
    level: 2,
    totalCompletions: 32,
    averageRating: 4.8,
    totalReviews: 28,
    recommendationCount: 20,
    isActive: true,
    activeRadiusKm: 5,
    services: [
      { category: 'digital_help', subcategory: 'phone_setup', isActive: true },
      { category: 'digital_help', subcategory: 'app_install', isActive: true },
      { category: 'digital_help', subcategory: 'kakaotalk', isActive: true },
    ],
    availability: [
      { dayOfWeek: 1, startTime: '10:00', endTime: '20:00', isActive: true },
      { dayOfWeek: 2, startTime: '10:00', endTime: '20:00', isActive: true },
      { dayOfWeek: 3, startTime: '10:00', endTime: '20:00', isActive: true },
      { dayOfWeek: 4, startTime: '10:00', endTime: '20:00', isActive: true },
      { dayOfWeek: 5, startTime: '10:00', endTime: '20:00', isActive: true },
      { dayOfWeek: 6, startTime: '10:00', endTime: '18:00', isActive: true },
      { dayOfWeek: 0, startTime: '14:00', endTime: '18:00', isActive: true },
    ],
  },
];

// ============================================
// Mock 서비스 요청
// ============================================

const now = new Date();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

export const mockRequests: ServiceRequest[] = [
  // 매칭 중인 요청
  {
    id: 'req-001',
    requesterId: 'user-001',
    category: 'childcare',
    subcategory: 'pickup_dropoff',
    title: '어린이집 등원 도움',
    description: '내일 아침 8시에 아이 어린이집 데려다주기. 역삼동에서 삼성동 해맑은어린이집까지요.',
    pricing: {
      basePrice: 1000,
      distanceFee: 200,
      demandMultiplier: 1.0,
      specialAdjustments: [],
      finalPrice: 1200,
    },
    requestType: 'scheduled',
    scheduledAt: new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString(),
    urgency: 'normal',
    location: {
      address: '서울시 강남구 역삼동 123-45',
      latitude: 37.5000,
      longitude: 127.0367,
    },
    destination: {
      address: '서울시 강남구 삼성동 해맑은어린이집',
      latitude: 37.5088,
      longitude: 127.0630,
    },
    distanceMeters: 1200,
    status: 'matching',
    paymentStatus: 'pending',
    createdAt: now.toISOString(),
  },
  // 매칭 완료된 요청
  {
    id: 'req-002',
    requesterId: 'user-001',
    category: 'digital_help',
    subcategory: 'phone_setup',
    title: '스마트폰 설정 도움',
    description: '새 스마트폰 초기 설정이랑 카카오톡 설치 부탁드려요.',
    pricing: {
      basePrice: 1000,
      distanceFee: 0,
      demandMultiplier: 1.0,
      specialAdjustments: [],
      finalPrice: 1000,
    },
    requestType: 'immediate',
    urgency: 'soon',
    location: {
      address: '서울시 강남구 역삼동 123-45',
      latitude: 37.5000,
      longitude: 127.0367,
    },
    distanceMeters: 0,
    status: 'matched',
    providerId: 'provider-003',
    provider: mockUsers.find(u => u.id === 'provider-003'),
    matchedAt: yesterday.toISOString(),
    paymentStatus: 'pending',
    createdAt: yesterday.toISOString(),
  },
  // 진행 중인 요청
  {
    id: 'req-003',
    requesterId: 'user-001',
    category: 'housework',
    subcategory: 'side_dish_3',
    title: '반찬 3가지 요리',
    description: '이번 주 먹을 반찬 3가지 부탁드려요. 김치찌개용 김치, 계란말이, 시금치나물이요.',
    pricing: {
      basePrice: 3500,
      distanceFee: 100,
      demandMultiplier: 1.0,
      specialAdjustments: [],
      finalPrice: 3600,
    },
    requestType: 'scheduled',
    scheduledAt: now.toISOString(),
    urgency: 'normal',
    location: {
      address: '서울시 강남구 역삼동 123-45',
      latitude: 37.5000,
      longitude: 127.0367,
    },
    distanceMeters: 500,
    status: 'in_progress',
    providerId: 'provider-002',
    provider: mockUsers.find(u => u.id === 'provider-002'),
    matchedAt: yesterday.toISOString(),
    startedAt: now.toISOString(),
    paymentStatus: 'pending',
    createdAt: yesterday.toISOString(),
  },
  // 완료된 요청
  {
    id: 'req-004',
    requesterId: 'user-001',
    category: 'childcare',
    subcategory: 'playground_watch',
    title: '놀이터 돌봄',
    description: '놀이터에서 아이 1시간 봐주시기. 5살 남자아이입니다.',
    pricing: {
      basePrice: 2000,
      distanceFee: 0,
      demandMultiplier: 1.0,
      specialAdjustments: [],
      finalPrice: 2000,
    },
    requestType: 'immediate',
    urgency: 'normal',
    location: {
      address: '서울시 강남구 역삼동 중앙공원 놀이터',
      latitude: 37.4998,
      longitude: 127.0360,
    },
    distanceMeters: 200,
    status: 'completed',
    providerId: 'provider-001',
    provider: mockUsers.find(u => u.id === 'provider-001'),
    matchedAt: twoDaysAgo.toISOString(),
    startedAt: twoDaysAgo.toISOString(),
    completedAt: twoDaysAgo.toISOString(),
    paymentStatus: 'paid',
    paymentMethod: 'cash',
    cashAmount: 2000,
    createdAt: twoDaysAgo.toISOString(),
  },
];

// ============================================
// Mock 채팅방 및 메시지
// ============================================

export const mockChatRooms: (ChatRoom & { otherUser: User })[] = [
  {
    id: 'chat-001',
    requestId: 'req-002',
    participants: ['user-001', 'provider-003'],
    lastMessage: {
      id: 'msg-003',
      roomId: 'chat-001',
      senderId: 'provider-003',
      content: '네, 오후 3시에 방문하겠습니다!',
      type: 'text',
      createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    },
    unreadCount: 1,
    createdAt: yesterday.toISOString(),
    otherUser: mockUsers.find(u => u.id === 'provider-003')!,
  },
  {
    id: 'chat-002',
    requestId: 'req-003',
    participants: ['user-001', 'provider-002'],
    lastMessage: {
      id: 'msg-006',
      roomId: 'chat-002',
      senderId: 'provider-002',
      content: '지금 재료 사러 마트 가고 있어요~',
      type: 'text',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
    unreadCount: 0,
    createdAt: yesterday.toISOString(),
    otherUser: mockUsers.find(u => u.id === 'provider-002')!,
  },
  {
    id: 'chat-003',
    requestId: 'req-004',
    participants: ['user-001', 'provider-001'],
    lastMessage: {
      id: 'msg-010',
      roomId: 'chat-003',
      senderId: 'user-001',
      content: '정말 감사합니다! 아이가 너무 좋아했어요 ^^',
      type: 'text',
      readAt: twoDaysAgo.toISOString(),
      createdAt: twoDaysAgo.toISOString(),
    },
    unreadCount: 0,
    createdAt: twoDaysAgo.toISOString(),
    otherUser: mockUsers.find(u => u.id === 'provider-001')!,
  },
];

export const mockMessages: Record<string, ChatMessage[]> = {
  'chat-001': [
    {
      id: 'msg-001',
      roomId: 'chat-001',
      senderId: 'user-001',
      content: '안녕하세요! 스마트폰 설정 도움 요청드린 홍길동입니다.',
      type: 'text',
      readAt: yesterday.toISOString(),
      createdAt: yesterday.toISOString(),
    },
    {
      id: 'msg-002',
      roomId: 'chat-001',
      senderId: 'provider-003',
      content: '안녕하세요! 이정수입니다. 언제 방문하면 될까요?',
      type: 'text',
      readAt: yesterday.toISOString(),
      createdAt: new Date(yesterday.getTime() + 5 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-003',
      roomId: 'chat-001',
      senderId: 'user-001',
      content: '오늘 오후 3시쯤 가능하실까요?',
      type: 'text',
      readAt: new Date(now.getTime() - 35 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 35 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-004',
      roomId: 'chat-001',
      senderId: 'provider-003',
      content: '네, 오후 3시에 방문하겠습니다!',
      type: 'text',
      createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    },
  ],
  'chat-002': [
    {
      id: 'msg-005',
      roomId: 'chat-002',
      senderId: 'provider-002',
      content: '안녕하세요! 반찬 요청 수락했습니다. 어떤 맛으로 해드릴까요?',
      type: 'text',
      readAt: yesterday.toISOString(),
      createdAt: yesterday.toISOString(),
    },
    {
      id: 'msg-006',
      roomId: 'chat-002',
      senderId: 'user-001',
      content: '너무 맵지 않게 해주시면 감사하겠습니다!',
      type: 'text',
      readAt: yesterday.toISOString(),
      createdAt: new Date(yesterday.getTime() + 10 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-007',
      roomId: 'chat-002',
      senderId: 'provider-002',
      content: '네 알겠습니다! 맛있게 해드릴게요~',
      type: 'text',
      readAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-008',
      roomId: 'chat-002',
      senderId: 'provider-002',
      content: '지금 재료 사러 마트 가고 있어요~',
      type: 'text',
      readAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ],
  'chat-003': [
    {
      id: 'msg-009',
      roomId: 'chat-003',
      senderId: 'provider-001',
      content: '아이가 정말 착하네요! 재미있게 놀았어요.',
      type: 'text',
      readAt: twoDaysAgo.toISOString(),
      createdAt: twoDaysAgo.toISOString(),
    },
    {
      id: 'msg-010',
      roomId: 'chat-003',
      senderId: 'user-001',
      content: '정말 감사합니다! 아이가 너무 좋아했어요 ^^',
      type: 'text',
      readAt: twoDaysAgo.toISOString(),
      createdAt: twoDaysAgo.toISOString(),
    },
  ],
};

// ============================================
// Mock 리뷰
// ============================================

export const mockReviews: Review[] = [
  // 내가 작성한 리뷰
  {
    id: 'review-001',
    requestId: 'req-004',
    reviewerId: 'user-001',
    revieweeId: 'provider-001',
    rating: 5,
    content: '아이를 정말 잘 봐주셨어요! 다음에도 꼭 부탁드리고 싶습니다.',
    createdAt: twoDaysAgo.toISOString(),
  },
  // 내가 받은 리뷰 (제공자 모드일 때)
  {
    id: 'review-002',
    requestId: 'req-101',
    reviewerId: 'user-002',
    revieweeId: 'user-001',
    rating: 5,
    content: '정말 친절하시고 꼼꼼하게 도와주셨어요!',
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'review-003',
    requestId: 'req-102',
    reviewerId: 'user-003',
    revieweeId: 'user-001',
    rating: 4,
    content: '시간 약속을 잘 지켜주셔서 좋았습니다.',
    createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'review-004',
    requestId: 'req-103',
    reviewerId: 'user-004',
    revieweeId: 'user-001',
    rating: 5,
    content: '아이가 너무 좋아했어요. 감사합니다!',
    createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// 리뷰와 함께 표시할 요청자/제공자 정보
export const getReviewWithUser = (review: Review) => {
  const reviewer = findUserById(review.reviewerId);
  const reviewee = findUserById(review.revieweeId);
  const request = findRequestById(review.requestId);
  return { ...review, reviewer, reviewee, request };
};

// ============================================
// Mock 거래 내역
// ============================================

export interface Transaction {
  id: string;
  userId: string;
  type: 'charge' | 'payment' | 'receive' | 'withdraw';
  amount: number;
  balance: number;
  description: string;
  requestId?: string;
  createdAt: string;
}

export const mockTransactions: Transaction[] = [
  {
    id: 'txn-001',
    userId: 'user-001',
    type: 'charge',
    amount: 10000,
    balance: 10000,
    description: '잔액 충전',
    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'txn-002',
    userId: 'user-001',
    type: 'payment',
    amount: -2000,
    balance: 8000,
    description: '놀이터 돌봄 결제',
    requestId: 'req-004',
    createdAt: twoDaysAgo.toISOString(),
  },
  {
    id: 'txn-003',
    userId: 'user-001',
    type: 'charge',
    amount: 500,
    balance: 8500,
    description: '친구 추천 보너스',
    createdAt: yesterday.toISOString(),
  },
];

// ============================================
// Mock 알림
// ============================================

export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    userId: 'user-001',
    type: 'matching',
    title: '매칭 완료!',
    body: '스마트폰 설정 도움 요청이 이정수님과 매칭되었습니다.',
    data: { requestId: 'req-002' },
    createdAt: yesterday.toISOString(),
  },
  {
    id: 'notif-002',
    userId: 'user-001',
    type: 'chat',
    title: '새 메시지',
    body: '이정수: 네, 오후 3시에 방문하겠습니다!',
    data: { roomId: 'chat-001' },
    createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-003',
    userId: 'user-001',
    type: 'request',
    title: '서비스 시작',
    body: '박영희님이 반찬 요리 서비스를 시작했습니다.',
    data: { requestId: 'req-003' },
    createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

// ============================================
// 헬퍼 함수
// ============================================

export const findUserById = (id: string): User | undefined =>
  mockUsers.find(u => u.id === id);

export const findProviderProfileByUserId = (userId: string): ProviderProfile | undefined =>
  mockProviderProfiles.find(p => p.userId === userId);

export const findRequestById = (id: string): ServiceRequest | undefined =>
  mockRequests.find(r => r.id === id);

export const findChatRoomById = (id: string) =>
  mockChatRooms.find(r => r.id === id);

export const getMessagesForRoom = (roomId: string): ChatMessage[] =>
  mockMessages[roomId] || [];

// 현재 로그인 사용자
export const getCurrentUser = (): User => mockUsers[0];

// ============================================
// Mock 수익 데이터 (제공자용)
// ============================================

export interface Earning {
  id: string;
  providerId: string;
  requestId: string;
  amount: number;
  status: 'pending' | 'available' | 'withdrawn';
  serviceName: string;
  requesterName: string;
  completedAt: string;
  availableAt?: string;
  withdrawnAt?: string;
}

export const mockEarnings: Earning[] = [
  {
    id: 'earn-001',
    providerId: 'user-001',
    requestId: 'req-201',
    amount: 2000,
    status: 'available',
    serviceName: '놀이터 돌봄',
    requesterName: '이영수',
    completedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    availableAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'earn-002',
    providerId: 'user-001',
    requestId: 'req-202',
    amount: 3500,
    status: 'available',
    serviceName: '반찬 3가지',
    requesterName: '박지은',
    completedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    availableAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'earn-003',
    providerId: 'user-001',
    requestId: 'req-203',
    amount: 1500,
    status: 'pending',
    serviceName: '마트 장보기',
    requesterName: '최민수',
    completedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'earn-004',
    providerId: 'user-001',
    requestId: 'req-204',
    amount: 5000,
    status: 'withdrawn',
    serviceName: '청소 도움',
    requesterName: '김하늘',
    completedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    availableAt: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    withdrawnAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ============================================
// Mock 최근 위치
// ============================================

export interface RecentLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  usedAt: string;
}

export const mockRecentLocations: RecentLocation[] = [
  {
    id: 'loc-001',
    name: '집',
    address: '서울시 강남구 역삼동 123-45',
    latitude: 37.5000,
    longitude: 127.0367,
    usedAt: now.toISOString(),
  },
  {
    id: 'loc-002',
    name: '회사',
    address: '서울시 강남구 테헤란로 152',
    latitude: 37.5004,
    longitude: 127.0365,
    usedAt: yesterday.toISOString(),
  },
  {
    id: 'loc-003',
    name: '해맑은어린이집',
    address: '서울시 강남구 삼성동 45-12',
    latitude: 37.5088,
    longitude: 127.0630,
    usedAt: twoDaysAgo.toISOString(),
  },
];

// ============================================
// Mock 개인정보 설정
// ============================================

export interface PrivacySettings {
  showPhoneNumber: boolean;
  showAddress: boolean;
  showProfileToNonMembers: boolean;
  allowLocationTracking: boolean;
  dataRetentionDays: 365 | 180 | 90;
}

export const mockPrivacySettings: PrivacySettings = {
  showPhoneNumber: false,
  showAddress: true,
  showProfileToNonMembers: false,
  allowLocationTracking: true,
  dataRetentionDays: 365,
};
