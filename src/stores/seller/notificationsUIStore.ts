import { create } from "zustand";

interface NotificationsUIState {
  currentPage: number;
  selectedNotifications: string[];
  setCurrentPage: (page: number) => void;
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
}

export const useNotificationsUIStore = create<NotificationsUIState>((set) => ({
  currentPage: 1,
  selectedNotifications: [],
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  toggleSelection: (id) => set((state) => ({
    selectedNotifications: state.selectedNotifications.includes(id)
      ? state.selectedNotifications.filter(i => i !== id)
      : [...state.selectedNotifications, id]
  })),
  
  selectAll: (ids) => set({ selectedNotifications: ids }),
  
  clearSelection: () => set({ selectedNotifications: [] }),
}));
