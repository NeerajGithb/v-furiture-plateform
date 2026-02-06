import { create } from "zustand";
import { SellerUIState } from '@/types';

export const useSellerUIStore = create<SellerUIState>((set, get) => ({
  // UI state
  expandedSeller: null,
  selectedSellers: [],
  
  // UI actions
  setExpandedSeller: (sellerId: string | null) => set({ expandedSeller: sellerId }),
  setSelectedSellers: (sellerIds: string[]) => set({ selectedSellers: sellerIds }),
  
  toggleSellerSelection: (sellerId: string) => {
    const { selectedSellers } = get();
    const isSelected = selectedSellers.includes(sellerId);
    
    if (isSelected) {
      set({ selectedSellers: selectedSellers.filter(id => id !== sellerId) });
    } else {
      set({ selectedSellers: [...selectedSellers, sellerId] });
    }
  },
  
  clearSelection: () => set({ selectedSellers: [] }),
}));
