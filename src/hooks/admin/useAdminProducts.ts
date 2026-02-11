import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useGlobalFilterStore } from "@/stores/globalFilterStore";
import { useProductUIStore } from "@/stores/admin/productStore";
import { adminProductsService } from "@/services/admin/adminProductsService";
import type { AdminProduct, ProductStats } from "@/lib/domain/admin/products/IAdminProductsRepository";
import { PaginationResult } from "@/lib/domain/shared/types";

export const useAdminProducts = () => {
  const { admin, isLoading: authLoading } = useAuthGuard();
  const period = useGlobalFilterStore((s) => s.period);
  const currentPage = useProductUIStore((s) => s.currentPage);
  
  return useQuery<PaginationResult<AdminProduct>>({
    queryKey: ["admin-products", period, currentPage],
    queryFn: () => adminProductsService.getProducts({ period, page: currentPage, limit: 20 }),
    enabled: !!admin && !authLoading,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useAdminProductStats = () => {
  const { admin, isLoading: authLoading } = useAuthGuard();
  const period = useGlobalFilterStore(s => s.period);
  
  return useQuery<ProductStats>({
    queryKey: ["admin-product-stats", period],
    queryFn: () => adminProductsService.getProductStats(period),
    enabled: !!admin && !authLoading,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useAdminProduct = (productId: string) => {
  const { admin, isLoading: authLoading } = useAuthGuard();
  
  return useQuery<AdminProduct>({
    queryKey: ["admin-product", productId],
    queryFn: () => adminProductsService.getProductById(productId),
    enabled: !!admin && !authLoading && !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useUpdateAdminProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: any }) =>
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

export const useTogglePublishProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, isPublished }: { productId: string; isPublished: boolean }) =>
      adminProductsService.togglePublishProduct(productId, isPublished),
    onSuccess: (updatedProduct, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.setQueryData(["admin-product", productId], updatedProduct);
      queryClient.invalidateQueries({ queryKey: ["admin-product-stats"] });
      toast.success(updatedProduct.isPublished ? "Product published" : "Product unpublished");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useBulkUpdateAdminProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => adminProductsService.bulkUpdateProducts(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product-stats"] });
      toast.success(`Updated ${result.successCount} products successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useBulkPublishProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productIds, isPublished }: { productIds: string[]; isPublished: boolean }) =>
      adminProductsService.bulkPublishProducts(productIds, isPublished),
    onSuccess: (result, { isPublished }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product-stats"] });
      toast.success(`${result.successCount} products ${isPublished ? 'published' : 'unpublished'}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useBulkDeleteProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productIds: string[]) => adminProductsService.bulkDeleteProducts(productIds),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product-stats"] });
      toast.success(`${result.successCount} products deleted`);
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