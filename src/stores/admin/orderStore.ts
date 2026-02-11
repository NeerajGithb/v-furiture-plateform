import { create } from 'zustand';

interface OrderUIState {
  expandedOrder: string | null;
  currentPage: number;
  setExpandedOrder: (orderId: string | null) => void;
  setCurrentPage: (page: number) => void;
}

export const useOrderUIStore = create<OrderUIState>((set) => ({
  expandedOrder: null,
  currentPage: 1,
  
  setExpandedOrder: (orderId) => set({ expandedOrder: orderId }),
  setCurrentPage: (page) => set({ currentPage: page }),
}));