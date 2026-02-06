import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { adminFinanceService } from "@/services/admin/adminFinanceService";
import { TimePeriod } from "@/types/common";

export const useAdminFinance = (period: TimePeriod = '30days', enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin-finance", period],
    queryFn: () => adminFinanceService.getFinanceData(period),
    enabled: enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useAdminFinanceStats = (period: TimePeriod = '30days', enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin-finance-stats", period],
    queryFn: () => adminFinanceService.getFinancialStats(period),
    enabled: enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useUpdateTransactionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transactionId, status, notes }: { transactionId: string; status: string; notes?: string }) =>
      adminFinanceService.updateTransactionStatus(transactionId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-finance"] });
      queryClient.invalidateQueries({ queryKey: ["admin-finance-stats"] });
      toast.success("Transaction status updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useExportAdminFinanceData = () => {
  return useMutation({
    mutationFn: (params: { period: TimePeriod; format?: 'csv' | 'xlsx' | 'pdf' }) => 
      adminFinanceService.exportFinanceReport(params),
    onSuccess: () => {
      toast.success("Finance data exported successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};