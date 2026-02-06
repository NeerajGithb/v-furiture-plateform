import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { sellerEarningsService } from "@/services/seller/sellerEarningsService";
import { 
  EarningsQuery,
  PayoutRequest,
  EarningsFilters,
  PayoutFilters,
  EarningsExportData,
  BulkTransactionAction
} from "@/types/sellerEarnings";

export const useSellerEarnings = (params: EarningsQuery = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["seller-earnings", params],
    queryFn: () => sellerEarningsService.getEarningsData(params),
    enabled: enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useSellerEarningsSummary = (period?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["seller-earnings-summary", period],
    queryFn: () => sellerEarningsService.getEarningsSummary(period),
    enabled: enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useSellerTransactions = (params: EarningsFilters = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["seller-transactions", params],
    queryFn: () => sellerEarningsService.getTransactions(params),
    enabled: enabled,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useSellerPayouts = (params: PayoutFilters = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["seller-payouts", params],
    queryFn: () => sellerEarningsService.getPayouts(params),
    enabled: enabled,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useSellerEarningsAnalytics = (period?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["seller-earnings-analytics", period],
    queryFn: () => sellerEarningsService.getAnalytics(period),
    enabled: enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useSellerTransaction = (transactionId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["seller-transaction", transactionId],
    queryFn: () => sellerEarningsService.getTransactionById(transactionId),
    enabled: enabled && !!transactionId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useSellerPayout = (payoutId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["seller-payout", payoutId],
    queryFn: () => sellerEarningsService.getPayoutById(payoutId),
    enabled: enabled && !!payoutId,
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
  return useMutation({
    mutationFn: (options: EarningsExportData) => sellerEarningsService.exportEarnings(options),
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