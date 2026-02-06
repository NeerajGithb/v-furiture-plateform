import { create } from 'zustand';
import { SellerProfileUIState } from '@/types';

export const useProfileStore = create<SellerProfileUIState>((set) => ({
  // Modal states
  isEditModalOpen: false,
  isPasswordModalOpen: false,
  isDocumentModalOpen: false,
  
  // Form states
  selectedTab: 'profile',
  selectedDocument: null,
  
  // UI actions
  setEditModalOpen: (open) => set({ isEditModalOpen: open }),
  setPasswordModalOpen: (open) => set({ isPasswordModalOpen: open }),
  setDocumentModalOpen: (open) => set({ isDocumentModalOpen: open }),
  setSelectedTab: (tab) => set({ selectedTab: tab }),
  setSelectedDocument: (document) => set({ selectedDocument: document }),
  
  // Reset function
  reset: () => set({
    isEditModalOpen: false,
    isPasswordModalOpen: false,
    isDocumentModalOpen: false,
    selectedTab: 'profile',
    selectedDocument: null,
  }),
}));
