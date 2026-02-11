import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { sellerEarningsService } from "@/services/seller/sellerEarningsService";
import { useGlobalFilterStore } from "@/stores/globalFilterStore";
import { useEarningsUIStore } from "@/stores/seller/earningsUIStore";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { 
  PayoutRequest,
  EarningsExportData,
  BulkTransactionAction
} from "@/types/seller/earnings";

export const useSellerEarnings = () => {
  const { seller, isLoading: authLoading } = useAuthGuard();
  const period = useGlobalFilterStore(s => s.period);
  
  return useQuery({
    queryKey: ["seller-earnings", period],
    queryFn: () => sellerEarningsService.getEarningsData({ period }),
    enabled: !!seller && !authLoading,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useSellerEarningsSummary = () => {
  const { seller, isLoading: authLoading } = useAuthGuard();
  const period = useGlobalFilterStore(s => s.period);
  
  return useQuery({
    queryKey: ["seller-earnings-summary", period],
    queryFn: () => sellerEarningsService.getEarningsSummary(period),
    enabled: !!seller && !authLoading,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useSellerTransactions = () => {
  const { seller, isLoading: authLoading } = useAuthGuard();
  const transactionsPage = useEarningsUIStore(s => s.transactionsPage);
  
  return useQuery({
    queryKey: ["seller-transactions", { page: transactionsPage, limit: 20 }],
    queryFn: () => sellerEarningsService.getTransactions({ page: transactionsPage, limit: 20 }),
    enabled: !!seller && !authLoading,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useSellerPayouts = () => {
  const { seller, isLoading: authLoading } = useAuthGuard();
  const payoutsPage = useEarningsUIStore(s => s.payoutsPage);
  
  return useQuery({
    queryKey: ["seller-payouts", { page: payoutsPage, limit: 10 }],
    queryFn: () => sellerEarningsService.getPayouts({ page: payoutsPage, limit: 10 }),
    enabled: !!seller && !authLoading,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useSellerEarningsAnalytics = () => {
  const { seller, isLoading: authLoading } = useAuthGuard();
  const period = useGlobalFilterStore(s => s.period);
  
  return useQuery({
    queryKey: ["seller-earnings-analytics", period],
    queryFn: () => sellerEarningsService.getAnalytics(period),
    enabled: !!seller && !authLoading,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useRequestPayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PayoutRequest) => sellerEarningsService.requestPayout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-earnings"] });
      queryClient.invalidateQueries({ queryKey: ["seller-earnings-summary"] });
      queryClient.invalidateQueries({ queryKey: ["seller-payouts"] });
      toast.success("Payout request submitted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useCancelPayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payoutId: string) => sellerEarningsService.cancelPayout(payoutId),
    onSuccess: (_, payoutId) => {
      queryClient.invalidateQueries({ queryKey: ["seller-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["seller-payout", payoutId] });
      queryClient.invalidateQueries({ queryKey: ["seller-earnings-summary"] });
      toast.success("Payout request cancelled successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useExportEarnings = () => {
  const period = useGlobalFilterStore(s => s.period);
  
  return useMutation({
    mutationFn: (options: EarningsExportData) => sellerEarningsService.exportEarnings({
      ...options,
      period: options.period || period
    }),
    onSuccess: () => {
      toast.success("Earnings data exported successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useBulkTransactionAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkTransactionAction) => sellerEarningsService.bulkTransactionAction(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["seller-transactions"] });
      toast.success(result.message || "Bulk action completed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};