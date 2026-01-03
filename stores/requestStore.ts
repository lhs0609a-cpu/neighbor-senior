import { create } from 'zustand';
import type { ServiceRequest, ServiceCategory, PriceResult } from '@/types';

interface RequestDraft {
  category?: ServiceCategory;
  subcategory?: string;
  description: string;
  scheduledAt?: string;
  urgency: 'immediate' | 'soon' | 'normal';
  location?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  destination?: {
    address: string;
    latitude: number;
    longitude: number;
  };
}

interface RequestState {
  // 현재 작성 중인 요청
  draft: RequestDraft;
  priceResult: PriceResult | null;
  isCalculating: boolean;

  // 활성 요청
  activeRequest: ServiceRequest | null;

  // 요청 목록
  requests: ServiceRequest[];

  // 액션
  updateDraft: (updates: Partial<RequestDraft>) => void;
  resetDraft: () => void;
  setPriceResult: (result: PriceResult | null) => void;
  setCalculating: (calculating: boolean) => void;
  setActiveRequest: (request: ServiceRequest | null) => void;
  setRequests: (requests: ServiceRequest[]) => void;
  addRequest: (request: ServiceRequest) => void;
  updateRequest: (id: string, updates: Partial<ServiceRequest>) => void;
}

const initialDraft: RequestDraft = {
  description: '',
  urgency: 'normal',
};

export const useRequestStore = create<RequestState>((set) => ({
  draft: initialDraft,
  priceResult: null,
  isCalculating: false,
  activeRequest: null,
  requests: [],

  updateDraft: (updates) => set((state) => ({
    draft: { ...state.draft, ...updates },
  })),

  resetDraft: () => set({
    draft: initialDraft,
    priceResult: null,
  }),

  setPriceResult: (result) => set({ priceResult: result }),

  setCalculating: (calculating) => set({ isCalculating: calculating }),

  setActiveRequest: (request) => set({ activeRequest: request }),

  setRequests: (requests) => set({ requests }),

  addRequest: (request) => set((state) => ({
    requests: [request, ...state.requests],
  })),

  updateRequest: (id, updates) => set((state) => ({
    requests: state.requests.map((r) =>
      r.id === id ? { ...r, ...updates } : r
    ),
    activeRequest: state.activeRequest?.id === id
      ? { ...state.activeRequest, ...updates }
      : state.activeRequest,
  })),
}));
