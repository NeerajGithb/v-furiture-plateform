import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { adminSellersService } from "@/services/admin/adminSellersService";

interface SellersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  verified?: boolean;
}

interface SellerStatusUpdate {
  status: "active" | "pending" | "suspended" | "inactive";
  reason?: string;
}

interface SellerVerificationUpdate {
  verified: boolean;
}

export const useAdminSellers = (params: SellersQuery = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin-sellers", params],
    queryFn: () => adminSellersService.getSellers(params),
    enabled: enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useAdminSellerStats = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin-seller-stats"],
    queryFn: () => adminSellersService.getSellerStats(),
    enabled: enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useAdminSeller = (sellerId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin-seller", sellerId],
    queryFn: () => adminSellersService.getSellerById(sellerId),
    enabled: enabled && !!sellerId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useUpdateSellerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sellerId, data }: { sellerId: string; data: SellerStatusUpdate }) =>
      adminSellersService.updateSellerStatus(sellerId, data),
    onSuccess: (updatedSeller, { sellerId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-sellers"] });
      queryClient.setQueryData(["admin-seller", sellerId], updatedSeller);
      queryClient.invalidateQueries({ queryKey: ["admin-seller-stats"] });
      toast.success("Seller status updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateSellerVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sellerId, data }: { sellerId: string; data: SellerVerificationUpdate }) =>
      adminSellersService.updateSellerVerification(sellerId, data),
    onSuccess: (updatedSeller, { sellerId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-sellers"] });
      queryClient.setQueryData(["admin-seller", sellerId], updatedSeller);
      toast.success("Seller verification updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};