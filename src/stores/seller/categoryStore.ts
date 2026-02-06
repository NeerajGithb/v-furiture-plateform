import { create } from 'zustand';

// UI-only store for category selection in seller forms
interface CategoryUIState {
  // Selection states
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  
  // Modal states
  isCategoryModalOpen: boolean;
  
  // UI actions
  setSelectedCategoryId: (id: string | null) => void;
  setSelectedSubcategoryId: (id: string | null) => void;
  setCategoryModalOpen: (open: boolean) => void;
  
  // Reset function
  reset: () => void;
}

export const useCategoryStore = create<CategoryUIState>((set) => ({
  // Selection states
  selectedCategoryId: null,
  selectedSubcategoryId: null,
  
  // Modal states
  isCategoryModalOpen: false,
  
  // UI actions
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id, selectedSubcategoryId: null }),
  setSelectedSubcategoryId: (id) => set({ selectedSubcategoryId: id }),
  setCategoryModalOpen: (open) => set({ isCategoryModalOpen: open }),
  
  // Reset function
  reset: () => set({
    selectedCategoryId: null,
    selectedSubcategoryId: null,
    isCategoryModalOpen: false,
  }),
}));
