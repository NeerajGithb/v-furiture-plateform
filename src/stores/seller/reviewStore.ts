import { create } from 'zustand';

interface SellerReviewUIState {
  // UI state only - no business logic
  selectedReviews: string[];
  activeTab: string;
  showResponseModal: boolean;
  showDeleteModal: boolean;
  respondingToReview: any | null;
  selectedFilters: {
    rating: string;
    status: string;
    verified: string;
  };
  
  // UI Actions
  setSelectedReviews: (reviewIds: string[]) => void;
  toggleReviewSelection: (reviewId: string) => void;
  selectAllReviews: (reviewIds: string[]) => void;
  clearSelection: () => void;
  setActiveTab: (tab: string) => void;
  setShowResponseModal: (show: boolean) => void;
  setShowDeleteModal: (show: boolean) => void;
  setRespondingToReview: (review: any | null) => void;
  setSelectedFilters: (filters: any) => void;
  reset: () => void;
}

export const useSellerReviewUIStore = create<SellerReviewUIState>((set, get) => ({
  selectedReviews: [],
  activeTab: 'all',
  showResponseModal: false,
  showDeleteModal: false,
  respondingToReview: null,
  selectedFilters: {
    rating: 'all',
    status: 'all',
    verified: 'all'
  },

  setSelectedReviews: (reviewIds: string[]) => set({ selectedReviews: reviewIds }),
  
  toggleReviewSelection: (reviewId: string) => {
    const { selectedReviews } = get();
    const isSelected = selectedReviews.includes(reviewId);
    
    set({
      selectedReviews: isSelected
        ? selectedReviews.filter(id => id !== reviewId)
        : [...selectedReviews, reviewId]
    });
  },

  selectAllReviews: (reviewIds: string[]) => set({ selectedReviews: reviewIds }),
  
  clearSelection: () => set({ selectedReviews: [] }),
  
  setActiveTab: (tab: string) => set({ activeTab: tab, selectedReviews: [] }),
  
  setShowResponseModal: (show: boolean) => set({ showResponseModal: show }),
  
  setShowDeleteModal: (show: boolean) => set({ showDeleteModal: show }),
  
  setRespondingToReview: (review: any | null) => set({ respondingToReview: review }),
  
  setSelectedFilters: (filters: any) => set({ 
    selectedFilters: { ...get().selectedFilters, ...filters } 
  }),

  reset: () => set({ 
    selectedReviews: [],
    activeTab: 'all',
    showResponseModal: false,
    showDeleteModal: false,
    respondingToReview: null,
    selectedFilters: {
      rating: 'all',
      status: 'all',
      verified: 'all'
    }
  }),
}));

// Keep the old store for backward compatibility during transition
export interface Review {
  _id: string;
  productId: string;
  userId: {
    _id: string;
    name: string;
    photoURL?: string;
  };
  rating: number;
  title?: string;
  comment: string;
  images: { url: string; publicId: string }[];
  helpfulVotes: number;
  unhelpfulVotes: number;
  isVerifiedPurchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  product?: {
    _id: string;
    name: string;
    mainImage?: { url: string };
  };
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  breakdown: { [key: number]: number };
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
}

interface ReviewStore {
  reviews: Review[];
  stats: ReviewStats | null;
  selectedReview: Review | null;
  loading: boolean;
  error: string | null;
  filters: {
    status: string;
    rating: string;
    productId: string;
    search: string;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReviews: number;
    hasMore: boolean;
  };

  setReviews: (reviews: Review[]) => void;
  setStats: (stats: ReviewStats) => void;
  setSelectedReview: (review: Review | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<ReviewStore['filters']>) => void;
  setPagination: (pagination: Partial<ReviewStore['pagination']>) => void;
  resetFilters: () => void;
  updateReviewStatus: (reviewId: string, status: 'approved' | 'rejected') => void;
  removeReview: (reviewId: string) => void;
}

const defaultFilters = {
  status: 'all',
  rating: 'all',
  productId: '',
  search: '',
};

const defaultPagination = {
  currentPage: 1,
  totalPages: 1,
  totalReviews: 0,
  hasMore: false,
};

const useSellerReviewStore = create<ReviewStore>((set) => ({
  reviews: [],
  stats: null,
  selectedReview: null,
  loading: false,
  error: null,
  filters: defaultFilters,
  pagination: defaultPagination,

  setReviews: (reviews) => set({ reviews }),
  setStats: (stats) => set({ stats }),
  setSelectedReview: (review) => set({ selectedReview: review }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  setPagination: (pagination) => set((state) => ({ pagination: { ...state.pagination, ...pagination } })),
  resetFilters: () => set({ filters: defaultFilters, pagination: defaultPagination }),
  
  updateReviewStatus: (reviewId, status) =>
    set((state) => ({
      reviews: state.reviews.map((review) =>
        review._id === reviewId ? { ...review, status } : review
      ),
    })),

  removeReview: (reviewId) =>
    set((state) => ({
      reviews: state.reviews.filter((review) => review._id !== reviewId),
    })),
}));

export default useSellerReviewStore;
