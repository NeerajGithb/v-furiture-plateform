import { create } from 'zustand';

interface FinanceUIState {
  selectedTransaction: string | null;
  showTransactionDetails: boolean;
  
  setSelectedTransaction: (transactionId: string | null) => void;
  setShowTransactionDetails: (show: boolean) => void;
  reset: () => void;
}

export const useFinanceUIStore = create<FinanceUIState>((set) => ({
  selectedTransaction: null,
  showTransactionDetails: false,

  setSelectedTransaction: (transactionId: string | null) => set({ selectedTransaction: transactionId }),
  
  setShowTransactionDetails: (show: boolean) => set({ showTransactionDetails: show }),

  reset: () => set({ 
    selectedTransaction: null,
    showTransactionDetails: false,
  }),
}));
