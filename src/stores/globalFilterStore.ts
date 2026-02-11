import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type TimePeriod = '1h' | '24h' | '7d' | '30d' | '90d' | '1y' | 'all';

interface GlobalScopeState {
  period: TimePeriod;
  setPeriod: (p: TimePeriod) => void;
  reset: () => void;
}

export const useGlobalFilterStore = create<GlobalScopeState>()(
  persist(
    (set) => ({
      period: '30d',

      setPeriod: (period: TimePeriod) => {
        set({ period });
      },

      reset: () => {
        set({ period: '30d' });
      },
    }),
    {
      name: 'global-filter-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        period: state.period,
      }),
    }
  )
);
