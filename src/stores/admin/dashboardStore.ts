import { create } from 'zustand';

interface DashboardUIState {
  // UI state only - no business logic
  selectedTab: string;
  showFilters: boolean;
  
  // Actions for UI state
  setSelectedTab: (tab: string) => void;
  setShowFilters: (show: boolean) => void;
}

export const useDashboardUIStore = create<DashboardUIState>((set) => ({
  // UI state
  selectedTab: 'overview',
  showFilters: false,
  
  // UI actions
  setSelectedTab: (tab: string) => set({ selectedTab: tab }),
  setShowFilters: (show: boolean) => set({ showFilters: show }),
}));