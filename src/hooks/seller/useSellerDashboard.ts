import { useQuery } from "@tanstack/react-query";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { sellerDashboardService } from "@/services/seller/sellerDashboardService";

interface DashboardQuery {
  period?: string;
}

export const useSellerDashboard = (params: DashboardQuery = {}, enabled: boolean = true) => {
  const { seller, isLoading: authLoading } = useAuthGuard();
  
  return useQuery({
    queryKey: ["seller-dashboard", params],
    queryFn: () => sellerDashboardService.getDashboardData(params),
    enabled: enabled && !!seller && !authLoading, // Only call API when seller exists and auth is not loading
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};