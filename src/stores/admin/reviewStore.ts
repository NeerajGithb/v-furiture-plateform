import { create } from 'zustand';

interface ReviewUIState {
  expandedReview: string | null;
  currentPage: number;
  selectedReviews: string[];
  
  setExpandedReview: (reviewId: string | null) => void;
  setCurrentPage: (page: number) => void;
  setSelectedReviews: (reviews: string[]) => void;
  toggleReviewSelection: (reviewId: string) => void;
  selectAllReviews: (reviewIds: string[]) => void;
  clearSelection: () => void;
}

export const useReviewUIStore = create<ReviewUIState>((set) => ({
  expandedReview: null,
  currentPage: 1,
  selectedReviews: [],
  
  setExpandedReview: (reviewId) => set({ expandedReview: reviewId }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setSelectedReviews: (reviews) => set({ selectedReviews: reviews }),
  
  toggleReviewSelection: (reviewId) => set((state) => ({
    selectedReviews: state.selectedReviews.includes(reviewId)
      ? state.selectedReviews.filter(id => id !== reviewId)
      : [...state.selectedReviews, reviewId]
  })),
  
  selectAllReviews: (reviewIds) => set({ selectedReviews: reviewIds }),
  clearSelection: () => set({ selectedReviews: [] }),
}));
