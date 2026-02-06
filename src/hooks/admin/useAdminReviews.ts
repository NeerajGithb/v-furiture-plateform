import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { adminReviewsService } from "@/services/admin/adminReviewsService";
import { 
  AdminReviewsQuery,
  AdminReviewUpdate,
  AdminReviewBulkUpdate
} from "@/types/review";

export const useAdminReviews = (params: AdminReviewsQuery = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin-reviews", params],
    queryFn: () => adminReviewsService.getReviews(params),
    enabled: enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useAdminReviewStats = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin-review-stats"],
    queryFn: () => adminReviewsService.getReviewStats(),
    enabled: enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useAdminReview = (reviewId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin-review", reviewId],
    queryFn: () => adminReviewsService.getReviewById(reviewId),
    enabled: enabled && !!reviewId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useUpdateAdminReviewStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: AdminReviewUpdate }) =>
      adminReviewsService.updateReviewStatus(reviewId, data),
    onSuccess: (updatedReview, { reviewId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.setQueryData(["admin-review", reviewId], updatedReview);
      queryClient.invalidateQueries({ queryKey: ["admin-review-stats"] });
      toast.success("Review status updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteAdminReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => adminReviewsService.deleteReview(reviewId),
    onSuccess: (_, reviewId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.removeQueries({ queryKey: ["admin-review", reviewId] });
      queryClient.invalidateQueries({ queryKey: ["admin-review-stats"] });
      toast.success("Review deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useBulkUpdateAdminReviews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdminReviewBulkUpdate) => adminReviewsService.bulkUpdateReviews(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin-review-stats"] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useExportAdminReviews = () => {
  return useMutation({
    mutationFn: (options: any) => adminReviewsService.exportReviews(options),
    onSuccess: () => {
      toast.success("Reviews exported successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};