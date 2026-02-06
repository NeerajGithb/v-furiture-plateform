import { create } from 'zustand';
import { SellerProductUIState } from '@/types';

export const useSellerProductUIStore = create<SellerProductUIState>((set, get) => ({
  selectedProducts: [],
  activeTab: 'all',
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,
  showBulkModal: false,
  editingProduct: null,
  selectedFilters: {
    status: 'all',
    category: 'all',
    stock: 'all'
  },

  setSelectedProducts: (productIds: string[]) => set({ selectedProducts: productIds }),
  
  toggleProductSelection: (productId: string) => {
    const { selectedProducts } = get();
    const isSelected = selectedProducts.includes(productId);
    
    set({
      selectedProducts: isSelected
        ? selectedProducts.filter(id => id !== productId)
        : [...selectedProducts, productId]
    });
  },

  selectAllProducts: (productIds: string[]) => set({ selectedProducts: productIds }),
  
  clearSelection: () => set({ selectedProducts: [] }),
  
  setActiveTab: (tab: string) => set({ activeTab: tab, selectedProducts: [] }),
  
  setShowCreateModal: (show: boolean) => set({ showCreateModal: show }),
  
  setShowEditModal: (show: boolean) => set({ showEditModal: show }),
  
  setShowDeleteModal: (show: boolean) => set({ showDeleteModal: show }),
  
  setShowBulkModal: (show: boolean) => set({ showBulkModal: show }),
  
  setEditingProduct: (product) => set({ editingProduct: product }),
  
  setSelectedFilters: (filters) => set({ 
    selectedFilters: { ...get().selectedFilters, ...filters } 
  }),

  reset: () => set({ 
    selectedProducts: [],
    activeTab: 'all',
    showCreateModal: false,
    showEditModal: false,
    showDeleteModal: false,
    showBulkModal: false,
    editingProduct: null,
    selectedFilters: {
      status: 'all',
      category: 'all',
      stock: 'all'
    }
  }),
}));
