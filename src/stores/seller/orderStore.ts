import { create } from 'zustand';
import { SellerOrderUIState } from '@/types/seller/orders';

export const useSellerOrderUIStore = create<SellerOrderUIState>((set, get) => ({
  selectedOrders: [],
  showFilters: false,
  expandedOrder: null,
  currentPage: 1,
  
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
  
  setShowFilters: (show: boolean) => {
    set({ showFilters: show });
  },
  
  setExpandedOrder: (orderId: string | null) => {
    set({ expandedOrder: orderId });
  },

  setCurrentPage: (page: number) => {
    set({ currentPage: page });
  },
  
  resetState: () => {
    set({
      selectedOrders: [],
      showFilters: false,
      expandedOrder: null,
      currentPage: 1
    });
  }
}));
