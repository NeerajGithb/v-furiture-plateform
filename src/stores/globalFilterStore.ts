import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type TimePeriod = '1h' | '24h' | '7d' | '30d' | '90d' | '1y' | 'all';

interface GlobalScopeState {
  period: TimePeriod;
  filterVersion: number; // Used to force refetch
  setPeriod: (p: TimePeriod) => void;
  reset: () => void;
}

export const useGlobalFilterStore = create<GlobalScopeState>()(
  persist(
    (set) => ({
      period: '1y',
      filterVersion: 0,

      setPeriod: (period: TimePeriod) => {
        set((state) => ({ 
          period, 
          filterVersion: state.filterVersion + 1 
        }));
      },

      reset: () => {
        set((state) => ({ 
          period: '1y',
          filterVersion: state.filterVersion + 1
        }));
      },
    }),
    {
      name: 'global-filter-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        period: state.period,
        // Don't persist filterVersion - it should reset on page load
      }),
    }
  )
);
