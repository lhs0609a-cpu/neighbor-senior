import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppMode = 'requester' | 'provider';

interface ModeState {
  mode: AppMode;
  isProviderActive: boolean; // 제공자 활동 상태 (ON/OFF)

  // 액션
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
  setProviderActive: (active: boolean) => void;
  toggleProviderActive: () => void;
}

export const useModeStore = create<ModeState>()(
  persist(
    (set) => ({
      mode: 'requester',
      isProviderActive: false,

      setMode: (mode) => set({ mode }),

      toggleMode: () => set((state) => ({
        mode: state.mode === 'requester' ? 'provider' : 'requester',
      })),

      setProviderActive: (active) => set({ isProviderActive: active }),

      toggleProviderActive: () => set((state) => ({
        isProviderActive: !state.isProviderActive,
      })),
    }),
    {
      name: 'mode-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
