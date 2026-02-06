import { create } from 'zustand';
import { CouponUIState } from '@/types';

export const useCouponUIStore = create<CouponUIState>((set) => ({
  // Initial state
  activeTab: 'all',
  showFilters: false,
  selectedCoupons: [],
  
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,
  editingCoupon: null,
  
  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  setShowFilters: (show) => set({ showFilters: show }),
  setSelectedCoupons: (coupons) => set({ selectedCoupons: coupons }),
  
  toggleCouponSelection: (couponId) => set((state) => ({
    selectedCoupons: state.selectedCoupons.includes(couponId)
      ? state.selectedCoupons.filter(id => id !== couponId)
      : [...state.selectedCoupons, couponId]
  })),
  
  selectAllCoupons: (couponIds) => set({ selectedCoupons: couponIds }),
  clearSelection: () => set({ selectedCoupons: [] }),
  
  // Modal actions
  setShowCreateModal: (show) => set({ showCreateModal: show }),
  setShowEditModal: (show) => set({ showEditModal: show }),
  setShowDeleteModal: (show) => set({ showDeleteModal: show }),
  setEditingCoupon: (coupon) => set({ editingCoupon: coupon }),
}));