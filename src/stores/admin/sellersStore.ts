import { create } from "zustand";

interface SellersUIState {
  currentPage: number;
  expandedSellerId: string | null;
  search: string;
  status: string;
  
  setCurrentPage: (page: number) => void;
  setExpandedSellerId: (sellerId: string | null) => void;
  setSearch: (search: string) => void;
  setStatus: (status: string) => void;
  clearExpandedSeller: () => void;
  resetFilters: () => void;
}

export const useSellersUIStore = create<SellersUIState>((set) => ({
  currentPage: 1,
  expandedSellerId: null,
  search: "",
  status: "all",
  
  setCurrentPage: (page) => set({ currentPage: Math.max(1, page) }),
  setExpandedSellerId: (sellerId) => set({ expandedSellerId: sellerId }),
  setSearch: (search) => set({ search, currentPage: 1 }),
  setStatus: (status) => set({ status, currentPage: 1 }),
  clearExpandedSeller: () => set({ expandedSellerId: null }),
  resetFilters: () => set({ search: "", status: "all", currentPage: 1 }),
}));