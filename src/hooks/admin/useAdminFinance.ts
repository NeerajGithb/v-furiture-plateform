import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useGlobalFilterStore } from "@/stores/globalFilterStore";
import { adminFinanceService } from "@/services/admin/adminFinanceService";

export const useAdminFinance = () => {
  const { admin, isLoading: authLoading } = useAuthGuard();
  const period = useGlobalFilterStore(s => s.period);
  
  return useQuery({
    queryKey: ["admin-finance", period],
    queryFn: () => adminFinanceService.getFinanceData(period),
    enabled: !!admin && !authLoading,
  });
};

export const useExportAdminFinanceData = () => {
  return useMutation({
    mutationFn: (params: { period?: string; format?: 'csv' | 'xlsx' | 'pdf' }) => 
      adminFinanceService.exportFinanceReport(params),
    onSuccess: () => {
      toast.success("Finance data exported successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};