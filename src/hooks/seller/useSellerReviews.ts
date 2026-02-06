import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { sellerReviewsService } from "@/services/seller/sellerReviewsService";
import { 
  ReviewsQuery,
  RespondToReviewRequest,
  ReportReviewRequest
} from "@/types/sellerReview";

export const useSellerReviews = (params: ReviewsQuery = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["seller-reviews", params],
    queryFn: () => sellerReviewsService.getReviews(params),
    enabled: enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useSellerReview = (reviewId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["seller-review", reviewId],
    queryFn: () => sellerReviewsService.getReviewById(reviewId),
    enabled: enabled && !!reviewId,
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

export const useReportReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: ReportReviewRequest }) =>
      sellerReviewsService.reportReview(reviewId, data),
    onSuccess: (_, { reviewId }) => {
      queryClient.invalidateQueries({ queryKey: ["seller-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["seller-review", reviewId] });
      toast.success("Review reported successfully");
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