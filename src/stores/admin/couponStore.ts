import { create } from 'zustand';

interface CouponUIState {
  currentPage: number;
  selectedCoupons: string[];
  showCreateModal: boolean;
  showEditModal: boolean;
  editingCoupon: any | null;

  setCurrentPage: (page: number) => void;
  setSelectedCoupons: (coupons: string[]) => void;
  toggleCouponSelection: (couponId: string) => void;
  clearSelection: () => void;
  setShowCreateModal: (show: boolean) => void;
  setShowEditModal: (show: boolean) => void;
  setEditingCoupon: (coupon: any | null) => void;
}

export const useCouponUIStore = create<CouponUIState>((set, get) => ({
  currentPage: 1,
  selectedCoupons: [],
  showCreateModal: false,
  showEditModal: false,
  editingCoupon: null,

  setCurrentPage: (page: number) => set({ currentPage: Math.max(1, page) }),
  
  setSelectedCoupons: (coupons: string[]) => set({ selectedCoupons: coupons }),
  
  toggleCouponSelection: (couponId: string) => {
    const { selectedCoupons } = get();
    const isSelected = selectedCoupons.includes(couponId);
    if (isSelected) {
      set({ selectedCoupons: selectedCoupons.filter(id => id !== couponId) });
    } else {
      set({ selectedCoupons: [...selectedCoupons, couponId] });
    }
  },
  
  clearSelection: () => set({ selectedCoupons: [] }),
  
  setShowCreateModal: (show: boolean) => set({ showCreateModal: show }),
  setShowEditModal: (show: boolean) => set({ showEditModal: show }),
  setEditingCoupon: (coupon: any | null) => set({ editingCoupon: coupon }),
}));