import { create } from 'zustand';
import { InventoryUIState } from '@/types/sellerInventory';

export const useInventoryStore = create<InventoryUIState>((set, get) => ({
  // Initial state
  editingStock: {},
  editingReorderLevel: {},
  selectedItems: [],
  showFilters: false,
  
  // Stock editing actions
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
  
  // Reorder level editing actions
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
  
  // Selection actions
  toggleItemSelection: (productId: string) => {
    set((state) => ({
      selectedItems: state.selectedItems.includes(productId)
        ? state.selectedItems.filter(id => id !== productId)
        : [...state.selectedItems, productId]
    }));
  },
  
  selectAllItems: (productIds: string[]) => {
    set({ selectedItems: productIds });
  },
  
  clearSelection: () => {
    set({ selectedItems: [] });
  },
  
  // UI actions
  setShowFilters: (show: boolean) => {
    set({ showFilters: show });
  },
  
  // Reset all state
  resetState: () => {
    set({
      editingStock: {},
      editingReorderLevel: {},
      selectedItems: [],
      showFilters: false
    });
  }
}));