import { create } from 'zustand';

// UI-only store for seller notifications page
interface NotificationUIState {
  // Filter states
  selectedFilter: 'all' | 'unread' | 'read';
  selectedType: 'all' | 'order' | 'review' | 'system' | 'payment';
  
  // Modal states
  isMarkAllModalOpen: boolean;
  selectedNotificationId: string | null;
  
  // UI actions
  setSelectedFilter: (filter: 'all' | 'unread' | 'read') => void;
  setSelectedType: (type: 'all' | 'order' | 'review' | 'system' | 'payment') => void;
  setMarkAllModalOpen: (open: boolean) => void;
  setSelectedNotificationId: (id: string | null) => void;
  
  // Reset function
  reset: () => void;
}

export const useNotificationStore = create<NotificationUIState>((set) => ({
  // Filter states
  selectedFilter: 'all',
  selectedType: 'all',
  
  // Modal states
  isMarkAllModalOpen: false,
  selectedNotificationId: null,
  
  // UI actions
  setSelectedFilter: (filter) => set({ selectedFilter: filter }),
  setSelectedType: (type) => set({ selectedType: type }),
  setMarkAllModalOpen: (open) => set({ isMarkAllModalOpen: open }),
  setSelectedNotificationId: (id) => set({ selectedNotificationId: id }),
  
  // Reset function
  reset: () => set({
    selectedFilter: 'all',
    selectedType: 'all',
    isMarkAllModalOpen: false,
    selectedNotificationId: null,
  }),
}));
