import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { sellerReviewsService } from "@/services/seller/sellerReviewsService";
import { useGlobalFilterStore } from "@/stores/globalFilterStore";
import { useReviewsUIStore } from "@/stores/seller/reviewsUIStore";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { 
  ReviewsQuery,
  RespondToReviewRequest
} from "@/types/seller/reviews";

export const useSellerReviews = () => {
  const { seller, isLoading: authLoading } = useAuthGuard();
  const period = useGlobalFilterStore(s => s.period);
  const currentPage = useReviewsUIStore(s => s.currentPage);

  return useQuery({
    queryKey: ["seller-reviews", period, currentPage],
    queryFn: () => sellerReviewsService.getReviews({ period, page: currentPage, limit: 20 }),
    enabled: !!seller && !authLoading,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useRespondToReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: RespondToReviewRequest }) =>
      sellerReviewsService.respondToReview(reviewId, data),
    onSuccess: (updatedReview, { reviewId }) => {
      queryClient.invalidateQueries({ queryKey: ["seller-reviews"] });
      queryClient.setQueryData(["seller-review", reviewId], updatedReview);
      toast.success("Response submitted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useExportSellerReviews = () => {
  return useMutation({
    mutationFn: (params: ReviewsQuery) => sellerReviewsService.exportReviews(params),
    onSuccess: () => {
      toast.success("Reviews exported successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};