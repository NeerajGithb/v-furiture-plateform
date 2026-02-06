import { create } from 'zustand';

interface SellerData {
  id: string;
  email: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  verified: boolean;
  commission: number;
  totalProducts: number;
  totalSales: number;
  revenue: number;
  rating: number;
  createdAt: string;
}

interface AdminData {
  id: string;
  email: string;
  role: 'admin' | 'superadmin';
  isActive: boolean;
  createdAt: string;
}

interface AuthState {
  seller: SellerData | null;
  admin: AdminData | null;
  sellerLoading: boolean;
  adminLoading: boolean;
  
  setSeller: (seller: SellerData | null) => void;
  setAdmin: (admin: AdminData | null) => void;
  setSellerLoading: (loading: boolean) => void;
  setAdminLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  seller: null,
  admin: null,
  sellerLoading: false,
  adminLoading: false,

  setSeller: (seller) => set({ seller }),
  setAdmin: (admin) => set({ admin }),
  setSellerLoading: (sellerLoading) => set({ sellerLoading }),
  setAdminLoading: (adminLoading) => set({ adminLoading }),
  
  clearAuth: () => set({ 
    seller: null, 
    admin: null, 
    sellerLoading: false, 
    adminLoading: false 
  }),
}));
