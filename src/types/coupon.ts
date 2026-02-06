// Coupon Types for Admin System

export type CouponType = 'flat' | 'percent';
export type CouponStatus = 'active' | 'inactive' | 'expired';

export interface AdminCoupon {
  _id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiry: string;
  usageLimit: number;
  perUserLimit: number;
  description?: string;
  usedCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastUsedAt?: string;
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedCategories?: string[];
  excludedProducts?: string[];
  firstTimeUserOnly?: boolean;
  minimumCartItems?: number;
}

export interface CouponStats {
  total: number;
  active: number;
  inactive: number;
  expired: number;
  totalUsages: number;
  totalSavings: number;
  averageDiscount: number;
  mostUsedCoupon?: {
    code: string;
    usedCount: number;
  };
  recentlyExpired: number;
  expiringThisWeek: number;
}

export interface CouponsResponse {
  coupons: AdminCoupon[];
  stats?: CouponStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CouponFilters {
  status?: CouponStatus;
  type?: CouponType;
  search?: string;
  period?: string;
  limit?: number;
  minValue?: number;
  maxValue?: number;
  expiring?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface CouponFormData {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiry: string;
  usageLimit: number;
  perUserLimit: number;
  description: string;
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedCategories?: string[];
  excludedProducts?: string[];
  firstTimeUserOnly?: boolean;
  minimumCartItems?: number;
}

export interface CouponUpdateData {
  code?: string;
  type?: CouponType;
  value?: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  expiry?: string;
  usageLimit?: number;
  perUserLimit?: number;
  description?: string;
  active?: boolean;
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedCategories?: string[];
  excludedProducts?: string[];
  firstTimeUserOnly?: boolean;
  minimumCartItems?: number;
}

// UI State interfaces
export interface CouponUIState {
  activeTab: string;
  showFilters: boolean;
  selectedCoupons: string[];
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  editingCoupon: AdminCoupon | null;
  setActiveTab: (tab: string) => void;
  setShowFilters: (show: boolean) => void;
  setSelectedCoupons: (coupons: string[]) => void;
  toggleCouponSelection: (couponId: string) => void;
  selectAllCoupons: (couponIds: string[]) => void;
  clearSelection: () => void;
  setShowCreateModal: (show: boolean) => void;
  setShowEditModal: (show: boolean) => void;
  setShowDeleteModal: (show: boolean) => void;
  setEditingCoupon: (coupon: AdminCoupon | null) => void;
}

// Component Props interfaces
export interface CouponsOverviewProps {
  stats: CouponStats;
  onTabChange: (tab: string) => void;
  activeTab: string;
}

export interface CouponsTableProps {
  coupons: AdminCoupon[];
  selectedCoupons: string[];
  onToggleSelection: (couponId: string) => void;
  onSelectAll: (couponIds: string[]) => void;
  onEditCoupon: (coupon: AdminCoupon) => void;
  onDeleteCoupon: (couponId: string) => void;
  onToggleStatus: (couponId: string, active: boolean) => void;
}

export interface CouponFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CouponFormData) => void;
  editingCoupon: AdminCoupon | null;
  isLoading: boolean;
}