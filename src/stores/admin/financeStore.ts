import { create } from 'zustand';
import { TimePeriod } from '@/types/common';

interface FinanceUIState {
  selectedTransaction: string | null;
  showTransactionDetails: boolean;
  selectedPeriod: TimePeriod;
  
  // UI Actions
  setSelectedTransaction: (transactionId: string | null) => void;
  setShowTransactionDetails: (show: boolean) => void;
  setSelectedPeriod: (period: TimePeriod) => void;
  reset: () => void;
}

export const useFinanceUIStore = create<FinanceUIState>((set) => ({
  selectedTransaction: null,
  showTransactionDetails: false,
  selectedPeriod: '30days',

  setSelectedTransaction: (transactionId: string | null) => set({ selectedTransaction: transactionId }),
  
  setShowTransactionDetails: (show: boolean) => set({ showTransactionDetails: show }),
  
  setSelectedPeriod: (period) => set({ selectedPeriod: period }),

  reset: () => set({ 
    selectedTransaction: null,
    showTransactionDetails: false,
    selectedPeriod: '30days'
  }),
}));
