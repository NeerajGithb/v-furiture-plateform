import { create } from 'zustand';

interface UserUIState {
  // Pagination state
  currentPage: number;
  
  // Modal state
  selectedUserId: string | null;
  
  // Actions
  setCurrentPage: (page: number) => void;
  setSelectedUserId: (userId: string | null) => void;
  clearSelectedUser: () => void;
}

export const useUserUIStore = create<UserUIState>((set) => ({
  // Initial state
  currentPage: 1,
  selectedUserId: null,
  
  // Actions
  setCurrentPage: (page) => set({ currentPage: Math.max(1, page) }),
  setSelectedUserId: (userId) => set({ selectedUserId: userId }),
  clearSelectedUser: () => set({ selectedUserId: null }),
}));