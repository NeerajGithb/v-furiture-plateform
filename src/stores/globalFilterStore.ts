import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type TimePeriod = '1h' | '24h' | '7d' | '30d' | '90d' | '1y' | 'all';

interface GlobalScopeState {
  period: TimePeriod;
  filterVersion: number; // Used to force refetch
  setPeriod: (p: TimePeriod) => void;
  reset: () => void;
}

const STORAGE_VERSION = 2; // Increment this when changing defaults

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
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        period: state.period,
        // Don't persist filterVersion - it should reset on page load
      }),
      migrate: (persistedState: any, version: number) => {
        // If version is old or doesn't exist, reset to new defaults
        if (version < STORAGE_VERSION) {
          return {
            period: '1y',
            filterVersion: 0,
          };
        }
        return persistedState as GlobalScopeState;
      },
    }
  )
);
