import { create } from 'zustand';

interface EarningsUIState {
  activeTab: 'overview' | 'transactions' | 'payouts' | 'analytics';
  transactionsPage: number;
  payoutsPage: number;
  setActiveTab: (tab: 'overview' | 'transactions' | 'payouts' | 'analytics') => void;
  setTransactionsPage: (page: number) => void;
  setPayoutsPage: (page: number) => void;
}

export const useEarningsUIStore = create<EarningsUIState>((set) => ({
  activeTab: 'overview',
  transactionsPage: 1,
  payoutsPage: 1,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setTransactionsPage: (page) => set({ transactionsPage: page }),
  setPayoutsPage: (page) => set({ payoutsPage: page }),
}));
