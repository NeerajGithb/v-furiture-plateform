import { useQuery } from "@tanstack/react-query";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import adminDashboardService from "@/services/admin/adminDashboardService";

interface DashboardQuery {
  period?: string;
}

export const useAdminDashboard = (params: DashboardQuery = {}, enabled: boolean = true) => {
  const { admin, isLoading: authLoading } = useAuthGuard();
  
  return useQuery({
    queryKey: ["admin-dashboard", params],
    queryFn: () => adminDashboardService.getDashboardData(params),
    enabled: enabled && !!admin && !authLoading, // Only call API when admin exists and auth is not loading
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};