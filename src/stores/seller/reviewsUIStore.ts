import { create } from 'zustand';

interface ReviewsUIState {
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export const useReviewsUIStore = create<ReviewsUIState>((set) => ({
  currentPage: 1,
  setCurrentPage: (page) => set({ currentPage: page }),
}));
