import { create } from 'zustand';

interface SellerProductsStore {
  expandedProduct: string | null;
  currentPage: number;
  selectedProducts: string[];
  setExpandedProduct: (productId: string | null) => void;
  setCurrentPage: (page: number) => void;
  setSelectedProducts: (productIds: string[]) => void;
  toggleProductSelection: (productId: string) => void;
  clearSelection: () => void;
}

export const useSellerProductsStore = create<SellerProductsStore>((set) => ({
  expandedProduct: null,
  currentPage: 1,
  selectedProducts: [],
  setExpandedProduct: (productId) => set({ expandedProduct: productId }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setSelectedProducts: (productIds) => set({ selectedProducts: productIds }),
  toggleProductSelection: (productId) => set((state) => ({
    selectedProducts: state.selectedProducts.includes(productId)
      ? state.selectedProducts.filter(id => id !== productId)
      : [...state.selectedProducts, productId]
  })),
  clearSelection: () => set({ selectedProducts: [] }),
}));
