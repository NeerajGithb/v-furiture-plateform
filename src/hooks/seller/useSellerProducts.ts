import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useGlobalFilterStore } from "@/stores/globalFilterStore";
import { useSellerProductsStore } from "@/stores/seller/sellerProductsStore";
import { sellerProductsService } from "@/services/seller/sellerProductsService";
import { categoryService } from "@/services/seller/categoryService";
import { 
  CreateProductRequest, 
  UpdateProductRequest,
  BulkUpdateRequest,
  ExportOptions
} from "@/types/seller/products";

export const useSellerProducts = () => {
  const { seller, isLoading: authLoading } = useAuthGuard();
  const period = useGlobalFilterStore(s => s.period);
  const currentPage = useSellerProductsStore(s => s.currentPage);

  return useQuery({
    queryKey: ["seller-products", period, currentPage],
    queryFn: () => sellerProductsService.getProducts({ 
      period, 
      page: currentPage, 
      limit: 20 
    }),
    enabled: !!seller && !authLoading,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useSellerProductStats = () => {
  const { seller, isLoading: authLoading } = useAuthGuard();
  const period = useGlobalFilterStore(s => s.period);

  return useQuery({
    queryKey: ["seller-product-stats", period],
    queryFn: () => sellerProductsService.getProductStats(period),
    enabled: !!seller && !authLoading,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useSellerCategories = () => {
  const { seller, isLoading: authLoading } = useAuthGuard();

  return useQuery({
    queryKey: ["seller-categories"],
    queryFn: () => categoryService.getCategories(),
    enabled: !!seller && !authLoading,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useSellerSubcategories = () => {
  const { seller, isLoading: authLoading } = useAuthGuard();

  return useQuery({
    queryKey: ["seller-subcategories"],
    queryFn: () => categoryService.getSubcategories(),
    enabled: !!seller && !authLoading,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};



export const useSellerProduct = (productId: string) => {
  const { seller, isLoading: authLoading } = useAuthGuard();

  return useQuery({
    queryKey: ["seller-product", productId],
    queryFn: () => sellerProductsService.getProductById(productId),
    enabled: !!seller && !authLoading && !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useProductAnalytics = (productId: string) => {
  const { seller, isLoading: authLoading } = useAuthGuard();
  const period = useGlobalFilterStore(s => s.period);

  return useQuery({
    queryKey: ["product-analytics", productId, period],
    queryFn: () => sellerProductsService.getProductAnalytics(productId, period),
    enabled: !!seller && !authLoading && !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};



export const useProductReviews = (productId: string, params: { page?: number; limit?: number } = {}) => {
  const { seller, isLoading: authLoading } = useAuthGuard();

  return useQuery({
    queryKey: ["product-reviews", productId, params],
    queryFn: () => sellerProductsService.getProductReviews(productId, params),
    enabled: !!seller && !authLoading && !!productId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => sellerProductsService.createProduct(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: UpdateProductRequest }) =>
      sellerProductsService.updateProduct(productId, data),
    onSuccess: (result, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      queryClient.invalidateQueries({ queryKey: ["seller-product", productId] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, isPublished }: { productId: string; isPublished: boolean }) =>
      sellerProductsService.updateProductStatus(productId, isPublished),
    onSuccess: (result, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      queryClient.invalidateQueries({ queryKey: ["seller-product", productId] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => sellerProductsService.deleteProduct(productId),
    onSuccess: (result, productId) => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      queryClient.removeQueries({ queryKey: ["seller-product", productId] });
      toast.success(result.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useBulkUpdateProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkUpdateRequest) => sellerProductsService.bulkUpdateProducts(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      toast.success(`${result.message} (${result.modifiedCount} products updated)`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useBulkDeleteProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productIds: string[]) => sellerProductsService.bulkDeleteProducts(productIds),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      toast.success(`${result.message} (${result.deletedCount} products deleted)`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

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

export const useExportProducts = () => {
  return useMutation({
    mutationFn: (options: ExportOptions = {}) => sellerProductsService.exportProducts(options),
    onSuccess: (result) => {
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

export const useSellerProductById = useSellerProduct;
export const useCreateSellerProduct = useCreateProduct;
export const useUpdateSellerProduct = useUpdateProduct;
