import { create } from 'zustand';
import { TimePeriod, SortOrder, FilterParams } from '@/types';

// Extended filter state to support all sections
interface GlobalFilterState extends FilterParams {
  // Core filters
  period: TimePeriod;
  status?: string;
  search?: string;
  sortBy: string;
  sortOrder: SortOrder;
  page: number;
  limit: number;

  // Section-specific filters
  category?: string;
  stockStatus?: string; // for inventory: in_stock, low_stock, out_of_stock
  productStatus?: string; // for products: published, draft, outOfStock, lowStock
  orderStatus?: string; // for orders: pending, confirmed, processing, shipped, delivered, cancelled

  // Actions - ONLY UPDATE STATE, NO SIDE EFFECTS
  setPeriod: (period: TimePeriod) => void;
  setStatus: (status?: string) => void;
  setSearch: (search?: string) => void;
  setSorting: (sortBy: string, sortOrder: SortOrder) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;

  // Section-specific actions
  setCategory: (category?: string) => void;
  setStockStatus: (stockStatus?: string) => void;
  setProductStatus: (productStatus?: string) => void;
  setOrderStatus: (orderStatus?: string) => void;

  clearFilters: () => void;
  clearSectionFilters: () => void;
  getFilterParams: () => FilterParams & {
    category?: string;
    stockStatus?: string;
    productStatus?: string;
    orderStatus?: string;
  };
}

// Shared global filter store for both admin and seller
export const useGlobalFilterStore = create<GlobalFilterState>((set, get) => ({
  // Default state
  period: 'all',
  status: undefined,
  search: undefined,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 20,
  category: undefined,
  stockStatus: undefined,
  productStatus: undefined,
  orderStatus: undefined,

  // PURE STATE UPDATES - NO DATA FETCHING
  setPeriod: (period: TimePeriod) => {
    set({ period, page: 1 });
  },

  setStatus: (status?: string) => {
    set({ status, page: 1 });
  },

  setSearch: (search?: string) => {
    set({ search, page: 1 });
  },

  setSorting: (sortBy: string, sortOrder: SortOrder) => {
    set({ sortBy, sortOrder, page: 1 });
  },

  setPage: (page: number) => {
    set({ page });
  },

  setLimit: (limit: number) => {
    set({ limit, page: 1 });
  },

  setCategory: (category?: string) => {
    set({ category, page: 1 });
  },

  setStockStatus: (stockStatus?: string) => {
    set({ stockStatus, page: 1 });
  },

  setProductStatus: (productStatus?: string) => {
    set({ productStatus, page: 1 });
  },

  setOrderStatus: (orderStatus?: string) => {
    set({ orderStatus, page: 1 });
  },

  clearFilters: () => {
    set({
      period: 'all',
      status: undefined,
      search: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 20,
      category: undefined,
      stockStatus: undefined,
      productStatus: undefined,
      orderStatus: undefined,
    });
  },

  // Clear only section-specific filters (not search, period, pagination)
  clearSectionFilters: () => {
    set({
      stockStatus: undefined,
      productStatus: undefined,
      orderStatus: undefined,
      page: 1,
    });
  },

  getFilterParams: () => {
    const state = get();
    return {
      period: state.period,
      status: state.status,
      search: state.search,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder,
      page: state.page,
      limit: state.limit,
      category: state.category,
      stockStatus: state.stockStatus,
      productStatus: state.productStatus,
      orderStatus: state.orderStatus,
    };
  },
}));

export type { TimePeriod };
