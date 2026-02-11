import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useGlobalFilterStore } from "@/stores/globalFilterStore";
import { useReviewUIStore } from "@/stores/admin/reviewStore";
import { adminReviewsService } from "@/services/admin/adminReviewsService";
import { 
  AdminReviewUpdate,
  AdminReviewBulkUpdate
} from "@/types/admin/reviews";

export const useAdminReviews = () => {
  const { admin, isLoading: authLoading } = useAuthGuard();
  const period = useGlobalFilterStore(s => s.period);
  const currentPage = useReviewUIStore(s => s.currentPage);
  
  return useQuery({
    queryKey: ["admin-reviews", period, currentPage],
    queryFn: () => adminReviewsService.getReviews({ period, page: currentPage, limit: 10 }),
    enabled: !!admin && !authLoading,
  });
};

export const useAdminReviewStats = () => {
  const { admin, isLoading: authLoading } = useAuthGuard();
  const period = useGlobalFilterStore(s => s.period);
  
  return useQuery({
    queryKey: ["admin-review-stats", period],
    queryFn: () => adminReviewsService.getReviewStats(period),
    enabled: !!admin && !authLoading,
  });
};

export const useUpdateAdminReviewStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: AdminReviewUpdate }) =>
      adminReviewsService.updateReviewStatus(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
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