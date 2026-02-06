import { create } from 'zustand';
import { ProductApprovalStatus } from '@/types';

interface ProductUIState {
  // UI-only state
  selectedProducts: string[];
  expandedProduct: string | null;
  activeTab: 'overview' | 'pending' | 'approved' | 'rejected' | 'unpublished' | 'all';
  localSearch: string;
  statusFilter: ProductApprovalStatus | 'ALL';
  
  // Modal states
  showBulkApproveModal: boolean;
  showBulkRejectModal: boolean;
  showBulkPendingModal: boolean;
  showBulkPublishModal: boolean;
  showBulkDeleteModal: boolean;
  
  // Actions - UI state management only
  setSelectedProducts: (productIds: string[]) => void;
  toggleProductSelection: (productId: string) => void;
  clearSelection: () => void;
  setExpandedProduct: (productId: string | null) => void;
  setActiveTab: (tab: 'overview' | 'pending' | 'approved' | 'rejected' | 'unpublished' | 'all') => void;
  setLocalSearch: (search: string) => void;
  setStatusFilter: (status: ProductApprovalStatus | 'ALL') => void;
  
  // Modal actions
  setShowBulkApproveModal: (show: boolean) => void;
  setShowBulkRejectModal: (show: boolean) => void;
  setShowBulkPendingModal: (show: boolean) => void;
  setShowBulkPublishModal: (show: boolean) => void;
  setShowBulkDeleteModal: (show: boolean) => void;
}

export const useProductUIStore = create<ProductUIState>((set, get) => ({
  // UI state
  selectedProducts: [],
  expandedProduct: null,
  activeTab: 'overview',
  localSearch: '',
  statusFilter: 'ALL',
  
  // Modal states
  showBulkApproveModal: false,
  showBulkRejectModal: false,
  showBulkPendingModal: false,
  showBulkPublishModal: false,
  showBulkDeleteModal: false,

  // UI actions
  setSelectedProducts: (productIds: string[]) => set({ selectedProducts: productIds }),
  
  toggleProductSelection: (productId: string) => {
    const { selectedProducts } = get();
    const isSelected = selectedProducts.includes(productId);
    
    if (isSelected) {
      set({ selectedProducts: selectedProducts.filter(id => id !== productId) });
    } else {
      set({ selectedProducts: [...selectedProducts, productId] });
    }
  },
  
  clearSelection: () => set({ selectedProducts: [] }),
  
  setExpandedProduct: (productId: string | null) => set({ expandedProduct: productId }),
  
  setActiveTab: (tab) => {
    set({ 
      activeTab: tab,
      selectedProducts: [], // Clear selection when changing tabs
      localSearch: '', // Clear search when changing tabs
      statusFilter: 'ALL' // Reset status filter when changing tabs
    });
  },
  
  setLocalSearch: (search: string) => set({ localSearch: search }),
  
  setStatusFilter: (status: ProductApprovalStatus | 'ALL') => set({ statusFilter: status }),
  
  // Modal actions
  setShowBulkApproveModal: (show: boolean) => set({ showBulkApproveModal: show }),
  setShowBulkRejectModal: (show: boolean) => set({ showBulkRejectModal: show }),
  setShowBulkPendingModal: (show: boolean) => set({ showBulkPendingModal: show }),
  setShowBulkPublishModal: (show: boolean) => set({ showBulkPublishModal: show }),
  setShowBulkDeleteModal: (show: boolean) => set({ showBulkDeleteModal: show }),
}));

