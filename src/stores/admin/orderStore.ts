import { create } from 'zustand';
import { OrderUIState } from '@/types/order';

export const useOrderUIStore = create<OrderUIState>((set) => ({
  // Initial state
  expandedOrder: null,
  activeTab: 'all',
  
  // Actions
  setExpandedOrder: (orderId) => set({ expandedOrder: orderId }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));