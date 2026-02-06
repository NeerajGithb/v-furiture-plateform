import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { adminProductsService } from "@/services/admin/adminProductsService";
import { 
  AdminProductsQuery,
  AdminProductUpdate,
  AdminProductBulkUpdate
} from "@/types/adminProduct";

export const useAdminProducts = (params: AdminProductsQuery = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin-products", params],
    queryFn: () => adminProductsService.getProducts(params),
    enabled: enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useAdminProductStats = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin-product-stats"],
    queryFn: () => adminProductsService.getProductStats(),
    enabled: enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useAdminProduct = (productId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin-product", productId],
    queryFn: () => adminProductsService.getProductById(productId),
    enabled: enabled && !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useUpdateAdminProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: AdminProductUpdate }) =>
      adminProductsService.updateProduct(productId, data),
    onSuccess: (updatedProduct, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.setQueryData(["admin-product", productId], updatedProduct);
      queryClient.invalidateQueries({ queryKey: ["admin-product-stats"] });
      toast.success("Product updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteAdminProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => adminProductsService.deleteProduct(productId),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.removeQueries({ queryKey: ["admin-product", productId] });
      queryClient.invalidateQueries({ queryKey: ["admin-product-stats"] });
      toast.success("Product deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useBulkUpdateAdminProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdminProductBulkUpdate) => adminProductsService.bulkUpdateProducts(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product-stats"] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useExportAdminProducts = () => {
  return useMutation({
    mutationFn: (options: any) => adminProductsService.exportProducts(options),
    onSuccess: () => {
      toast.success("Products exported successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};