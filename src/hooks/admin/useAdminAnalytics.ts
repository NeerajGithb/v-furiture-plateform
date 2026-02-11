import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useGlobalFilterStore } from "@/stores/globalFilterStore";
import { adminAnalyticsService } from "@/services/admin/adminAnalyticsService";
import { AnalyticsExportRequest } from "@/types/admin/analytics";

export const useAdminAnalytics = () => {
  const { admin, isLoading: authLoading } = useAuthGuard();
  const period = useGlobalFilterStore(s => s.period);
  
  return useQuery({
    queryKey: ["admin-analytics", period],
    queryFn: () => adminAnalyticsService.getAnalyticsData({ period }),
    enabled: !!admin && !authLoading,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useExportAdminAnalyticsData = () => {
  return useMutation({
    mutationFn: (options: Partial<AnalyticsExportRequest>) => adminAnalyticsService.exportAnalyticsData(options),
    onSuccess: () => {
      toast.success("Analytics data exported successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};