import { create } from 'zustand';
import { ReviewUIState } from '@/types';

export const useReviewUIStore = create<ReviewUIState>((set) => ({
  // Initial state
  expandedReview: null,
  activeTab: 'all',
  showFilters: false,
  selectedReviews: [],
  
  showStatusModal: false,
  showDeleteModal: false,
  showReportModal: false,
  
  // Actions
  setExpandedReview: (reviewId) => set({ expandedReview: reviewId }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setShowFilters: (show) => set({ showFilters: show }),
  setSelectedReviews: (reviews) => set({ selectedReviews: reviews }),
  
  toggleReviewSelection: (reviewId) => set((state) => ({
    selectedReviews: state.selectedReviews.includes(reviewId)
      ? state.selectedReviews.filter(id => id !== reviewId)
      : [...state.selectedReviews, reviewId]
  })),
  
  selectAllReviews: (reviewIds) => set({ selectedReviews: reviewIds }),
  clearSelection: () => set({ selectedReviews: [] }),
  
  // Modal actions
  setShowStatusModal: (show) => set({ showStatusModal: show }),
  setShowDeleteModal: (show) => set({ showDeleteModal: show }),
  setShowReportModal: (show) => set({ showReportModal: show }),
}));
