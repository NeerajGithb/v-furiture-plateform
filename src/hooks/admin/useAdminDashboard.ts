import { useQuery } from "@tanstack/react-query";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useGlobalFilterStore } from "@/stores/globalFilterStore";
import adminDashboardService from "@/services/admin/adminDashboardService";

export const useAdminDashboard = () => {
  const { admin, isLoading: authLoading } = useAuthGuard();
  const period = useGlobalFilterStore(s => s.period);
  
  return useQuery({
    queryKey: ["admin-dashboard", period],
    queryFn: () => adminDashboardService.getDashboardData({ period }),
    enabled: !!admin && !authLoading,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
};