import { create } from 'zustand';

interface InventoryUIState {
  editingStock: { [productId: string]: number };
  editingReorderLevel: { [productId: string]: number };
  showFilters: boolean;
  currentPage: number;
  setEditingStock: (productId: string, value: number) => void;
  clearEditingStock: (productId: string) => void;
  clearAllEditingStock: () => void;
  setEditingReorderLevel: (productId: string, value: number) => void;
  clearEditingReorderLevel: (productId: string) => void;
  clearAllEditingReorderLevel: () => void;
  setShowFilters: (show: boolean) => void;
  setCurrentPage: (page: number) => void;
  resetState: () => void;
}

export const useInventoryStore = create<InventoryUIState>((set, get) => ({
  editingStock: {},
  editingReorderLevel: {},
  showFilters: false,
  currentPage: 1,
  
  setEditingStock: (productId: string, value: number) => {
    set((state) => ({
      editingStock: {
        ...state.editingStock,
        [productId]: value
      }
    }));
  },
  
  clearEditingStock: (productId: string) => {
    set((state) => {
      const newEditingStock = { ...state.editingStock };
      delete newEditingStock[productId];
      return { editingStock: newEditingStock };
    });
  },
  
  clearAllEditingStock: () => {
    set({ editingStock: {} });
  },
  
  setEditingReorderLevel: (productId: string, value: number) => {
    set((state) => ({
      editingReorderLevel: {
        ...state.editingReorderLevel,
        [productId]: value
      }
    }));
  },
  
  clearEditingReorderLevel: (productId: string) => {
    set((state) => {
      const newEditingReorderLevel = { ...state.editingReorderLevel };
      delete newEditingReorderLevel[productId];
      return { editingReorderLevel: newEditingReorderLevel };
    });
  },
  
  clearAllEditingReorderLevel: () => {
    set({ editingReorderLevel: {} });
  },
  
  setShowFilters: (show: boolean) => {
    set({ showFilters: show });
  },
  
  setCurrentPage: (page: number) => {
    set({ currentPage: page });
  },
  
  resetState: () => {
    set({
      editingStock: {},
      editingReorderLevel: {},
      showFilters: false,
      currentPage: 1
    });
  }
}));