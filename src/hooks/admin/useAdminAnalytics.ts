import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { adminAnalyticsService } from "@/services/admin/adminAnalyticsService";
import { AdminAnalyticsQuery } from "@/types/analytics";

export const useAdminAnalytics = (params: AdminAnalyticsQuery = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin-analytics", params],
    queryFn: () => adminAnalyticsService.getAnalyticsData(params),
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

export const useExportAdminAnalyticsData = () => {
  return useMutation({
    mutationFn: (options: any) => adminAnalyticsService.exportAnalyticsData(options),
    onSuccess: () => {
      toast.success("Analytics data exported successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};