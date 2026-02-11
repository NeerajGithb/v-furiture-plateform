import { BasePrivateService } from "../baseService";
import { 
  SellerProduct, 
  CreateProductRequest, 
  UpdateProductRequest,
  BulkUpdateRequest,
  ProductsQuery,
  ProductStats,
  ExportOptions
} from "@/types/seller/products";
import { PaginationResult } from "@/lib/domain/shared/types";

interface ProductsResponse {
  products: SellerProduct[];
  stats?: ProductStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}


interface ProductAnalyticsResponse {
  analytics: {
    views: { date: string; count: number }[];
    sales: { date: string; count: number; revenue: number }[];
    topPerformers: {
      productId: string;
      name: string;
      views: number;
      sales: number;
      revenue: number;
    }[];
    categoryPerformance: {
      categoryId: string;
      categoryName: string;
      products: number;
      sales: number;
      revenue: number;
    }[];
  };
}

class SellerProductsService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  // Get seller products with pagination and filters
  async getProducts(params: ProductsQuery = {}): Promise<PaginationResult<SellerProduct>> {
    return await this.getPaginated<SellerProduct>("/seller/products", {
      action: "list",
      ...params
    });
  }

  async getProductStats(period?: string): Promise<ProductStats> {
    const params: any = { stats: "true" };
    if (period) params.period = period;
    
    const response = await this.get<ProductStats>("/seller/products", params);

    if (response.success) {
      return response.data as ProductStats;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch product statistics.",
      );
    }
  }

  async getProductById(productId: string): Promise<SellerProduct> {
    const response = await this.get<{ product: SellerProduct }>(`/seller/products/${productId}`);

    if (response.success) {
      return response.data!.product;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch product.",
      );
    }
  }

  // Create new product
  async createProduct(data: CreateProductRequest): Promise<{ message: string; product: SellerProduct }> {
    const response = await this.post<SellerProduct>("/seller/products", {
      action: "create",
      ...data
    });

    if (response.success) {
      return {
        product: response.data!,
        message: (response as { meta?: { message?: string } }).meta?.message || 'Product created successfully'
      };
    } else {
      throw new Error(
        response.error?.message || "Failed to create product.",
      );
    }
  }

  // Update existing product
  async updateProduct(productId: string, data: UpdateProductRequest): Promise<{ message: string; product: SellerProduct }> {
    const response = await this.patch<{ product: SellerProduct }>(`/seller/products/${productId}`, data);

    if (response.success) {
      return {
        product: response.data!.product,
        message: (response as { meta?: { message?: string } }).meta?.message || 'Product updated successfully'
      };
    } else {
      throw new Error(
        response.error?.message || "Failed to update product.",
      );
    }
  }

  // Update product status (publish/unpublish)
  async updateProductStatus(productId: string, isPublished: boolean): Promise<{ message: string }> {
    const response = await this.post<{ isPublished: boolean }>(`/seller/products/${productId}`, {
      action: "updateStatus",
      isPublished
    });

    if (response.success) {
      return { message: response.meta?.message || 'Product status updated successfully' };
    } else {
      throw new Error(
        response.error?.message || "Failed to update product status.",
      );
    }
  }

  // Delete product
  async deleteProduct(productId: string): Promise<{ message: string }> {
    const response = await this.delete<{ message: string }>(`/seller/products/${productId}`);

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to delete product.",
      );
    }
  }

  // Bulk update products
  async bulkUpdateProducts(data: BulkUpdateRequest): Promise<{ modifiedCount: number; message: string }> {
    const response = await this.post<{ modifiedCount: number; message: string }>("/seller/products", {
      action: "bulk_update",
      ...data
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to bulk update products.",
      );
    }
  }

  // Bulk delete products
  async bulkDeleteProducts(productIds: string[]): Promise<{ deletedCount: number; message: string }> {
    const response = await this.post<{ deletedCount: number; message: string }>("/seller/products", {
      action: "bulk_delete",
      productIds
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to bulk delete products.",
      );
    }
  }

  // Duplicate product
  async duplicateProduct(productId: string): Promise<{ message: string; product: SellerProduct }> {
    const response = await this.post<{ message: string; product: SellerProduct }>(`/seller/products/${productId}`, {
      action: "duplicate"
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to duplicate product.",
      );
    }
  }

  // Get product analytics
  async getProductAnalytics(productId: string, period?: string): Promise<ProductAnalyticsResponse['analytics']> {
    const response = await this.post<ProductAnalyticsResponse>(`/seller/products/${productId}`, {
      action: "analytics",
      period
    });

    if (response.success) {
      return response.data!.analytics;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch product analytics.",
      );
    }
  }

  // Export products
  async exportProducts(options: ExportOptions = {}): Promise<{ downloadUrl: string; message: string }> {
    const queryParams = new URLSearchParams({
      action: "export",
      format: options.format || 'xlsx',
      ...Object.fromEntries(
        Object.entries(options).filter(([k]) => k !== 'format').map(([k, v]) => [k, String(v)])
      )
    });

    const response = await this.get<{ downloadUrl: string; message: string }>(
      `/seller/products?${queryParams.toString()}`
    );

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to export products.",
      );
    }
  }

  // Update product inventory
  async updateProductInventory(productId: string, quantity: number): Promise<{ message: string }> {
    const response = await this.post<{ message: string }>(`/seller/products/${productId}`, {
      action: "update_inventory",
      quantity
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to update product inventory.",
      );
    }
  }

  // Get product reviews
  async getProductReviews(productId: string, params: { page?: number; limit?: number } = {}): Promise<{
    reviews: any[];
    pagination: { page: number; limit: number; total: number; pages: number };
    summary: { average: number; count: number; distribution: { [key: number]: number } };
  }> {
    const response = await this.post<{
      reviews: any[];
      pagination: { page: number; limit: number; total: number; pages: number };
      summary: { average: number; count: number; distribution: { [key: number]: number } };
    }>(`/seller/products/${productId}`, {
      action: "get_reviews",
      ...params
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch product reviews.",
      );
    }
  }
}

// Export singleton instance
export const sellerProductsService = new SellerProductsService();