import { create } from 'zustand';
import { SellerOrderUIState } from '@/types/sellerOrder';

export const useSellerOrderUIStore = create<SellerOrderUIState>((set, get) => ({
  // Initial state
  selectedOrders: [],
  showFilters: false,
  expandedOrder: null,
  
  // Selection actions
  toggleOrderSelection: (orderId: string) => {
    set((state) => ({
      selectedOrders: state.selectedOrders.includes(orderId)
        ? state.selectedOrders.filter(id => id !== orderId)
        : [...state.selectedOrders, orderId]
    }));
  },
  
  selectAllOrders: (orderIds: string[]) => {
    set({ selectedOrders: orderIds });
  },
  
  clearSelection: () => {
    set({ selectedOrders: [] });
  },
  
  // UI actions
  setShowFilters: (show: boolean) => {
    set({ showFilters: show });
  },
  
  setExpandedOrder: (orderId: string | null) => {
    set({ expandedOrder: orderId });
  },
  
  // Reset all state
  resetState: () => {
    set({
      selectedOrders: [],
      showFilters: false,
      expandedOrder: null
    });
  }
}));
