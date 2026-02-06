import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { sellerProductsService } from "@/services/seller/sellerProductsService";
import { 
  CreateProductRequest, 
  UpdateProductRequest,
  BulkUpdateRequest,
  ProductsQuery,
  ExportOptions
} from "@/types/sellerProducts";

// Get products with filters and pagination
export const useSellerProducts = (params: ProductsQuery = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["seller-products", params],
    queryFn: () => sellerProductsService.getProducts(params),
    enabled: enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Get product statistics
export const useSellerProductStats = (period?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["seller-product-stats", period],
    queryFn: () => sellerProductsService.getProductStats(period),
    enabled: enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get single product
export const useSellerProduct = (productId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["seller-product", productId],
    queryFn: () => sellerProductsService.getProductById(productId),
    enabled: enabled && !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get product analytics
export const useProductAnalytics = (productId: string, period?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["product-analytics", productId, period],
    queryFn: () => sellerProductsService.getProductAnalytics(productId, period),
    enabled: enabled && !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get dashboard analytics
export const useDashboardAnalytics = (period?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["dashboard-analytics", period],
    queryFn: () => sellerProductsService.getDashboardAnalytics(period),
    enabled: enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get product reviews
export const useProductReviews = (productId: string, params: { page?: number; limit?: number } = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["product-reviews", productId, params],
    queryFn: () => sellerProductsService.getProductReviews(productId, params),
    enabled: enabled && !!productId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Create product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => sellerProductsService.createProduct(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      queryClient.invalidateQueries({ queryKey: ["seller-product-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Update product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: UpdateProductRequest }) =>
      sellerProductsService.updateProduct(productId, data),
    onSuccess: (result, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      queryClient.invalidateQueries({ queryKey: ["seller-product", productId] });
      queryClient.invalidateQueries({ queryKey: ["seller-product-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Update product status
export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, isPublished }: { productId: string; isPublished: boolean }) =>
      sellerProductsService.updateProductStatus(productId, isPublished),
    onSuccess: (result, { productId, isPublished }) => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      queryClient.invalidateQueries({ queryKey: ["seller-product", productId] });
      queryClient.invalidateQueries({ queryKey: ["seller-product-stats"] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Delete product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => sellerProductsService.deleteProduct(productId),
    onSuccess: (result, productId) => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      queryClient.removeQueries({ queryKey: ["seller-product", productId] });
      queryClient.invalidateQueries({ queryKey: ["seller-product-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Bulk update products
export const useBulkUpdateProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkUpdateRequest) => sellerProductsService.bulkUpdateProducts(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      queryClient.invalidateQueries({ queryKey: ["seller-product-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] });
      toast.success(`${result.message} (${result.modifiedCount} products updated)`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Bulk delete products
export const useBulkDeleteProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productIds: string[]) => sellerProductsService.bulkDeleteProducts(productIds),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      queryClient.invalidateQueries({ queryKey: ["seller-product-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] });
      toast.success(`${result.message} (${result.deletedCount} products deleted)`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Duplicate product
export const useDuplicateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => sellerProductsService.duplicateProduct(productId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      queryClient.invalidateQueries({ queryKey: ["seller-product-stats"] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Update product inventory
export const useUpdateProductInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      sellerProductsService.updateProductInventory(productId, quantity),
    onSuccess: (result, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      queryClient.invalidateQueries({ queryKey: ["seller-product", productId] });
      queryClient.invalidateQueries({ queryKey: ["seller-inventory"] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Export products
export const useExportProducts = () => {
  return useMutation({
    mutationFn: (options: ExportOptions = {}) => sellerProductsService.exportProducts(options),
    onSuccess: (result) => {
      // Create download link
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = `products-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Legacy hooks for backward compatibility
export const useSellerProductById = useSellerProduct;
export const useCreateSellerProduct = useCreateProduct;
export const useUpdateSellerProduct = useUpdateProduct;