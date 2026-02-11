import { create } from 'zustand';
import { ProductStatus } from '@/types/admin/products';

interface ProductUIState {
  currentPage: number;
  selectedProducts: string[];
  expandedProduct: string | null;
  activeTab: 'overview' | 'pending' | 'approved' | 'rejected' | 'unpublished' | 'all';
  localSearch: string;
  statusFilter: ProductStatus | 'ALL';

  showBulkApproveModal: boolean;
  showBulkRejectModal: boolean;
  showBulkPendingModal: boolean;
  showBulkPublishModal: boolean;
  showBulkDeleteModal: boolean;
  showRejectModal: boolean;
  showDeleteModal: boolean;

  setCurrentPage: (page: number) => void;
  setSelectedProducts: (productIds: string[]) => void;
  toggleProductSelection: (productId: string) => void;
  clearSelection: () => void;
  setExpandedProduct: (productId: string | null) => void;
  setActiveTab: (tab: 'overview' | 'pending' | 'approved' | 'rejected' | 'unpublished' | 'all') => void;
  setLocalSearch: (search: string) => void;
  setStatusFilter: (status: ProductStatus | 'ALL') => void;

  setShowBulkApproveModal: (show: boolean) => void;
  setShowBulkRejectModal: (show: boolean) => void;
  setShowBulkPendingModal: (show: boolean) => void;
  setShowBulkPublishModal: (show: boolean) => void;
  setShowBulkDeleteModal: (show: boolean) => void;
  setShowRejectModal: (show: boolean) => void;
  setShowDeleteModal: (show: boolean) => void;
}

export const useProductUIStore = create<ProductUIState>((set, get) => ({
  currentPage: 1,
  selectedProducts: [],
  expandedProduct: null,
  activeTab: 'overview',
  localSearch: '',
  statusFilter: 'ALL',

  showBulkApproveModal: false,
  showBulkRejectModal: false,
  showBulkPendingModal: false,
  showBulkPublishModal: false,
  showBulkDeleteModal: false,
  showRejectModal: false,
  showDeleteModal: false,

  setCurrentPage: (page: number) => set({ currentPage: Math.max(1, page) }),

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
      selectedProducts: [],
      localSearch: '',
      statusFilter: 'ALL'
    });
  },

  setLocalSearch: (search: string) => set({ localSearch: search }),

  setStatusFilter: (status: ProductStatus | 'ALL') => set({ statusFilter: status }),

  setShowBulkApproveModal: (show: boolean) => set({ showBulkApproveModal: show }),
  setShowBulkRejectModal: (show: boolean) => set({ showBulkRejectModal: show }),
  setShowBulkPendingModal: (show: boolean) => set({ showBulkPendingModal: show }),
  setShowBulkPublishModal: (show: boolean) => set({ showBulkPublishModal: show }),
  setShowBulkDeleteModal: (show: boolean) => set({ showBulkDeleteModal: show }),
  setShowRejectModal: (show: boolean) => set({ showRejectModal: show }),
  setShowDeleteModal: (show: boolean) => set({ showDeleteModal: show }),
}));

