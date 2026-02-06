import { BasePrivateService } from "../baseService";
import { 
  SellerProduct, 
  CreateProductRequest, 
  UpdateProductRequest,
  BulkUpdateRequest,
  ProductsQuery,
  ProductStats,
  ExportOptions
} from "@/types/sellerProducts";

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

interface ProductStatsResponse {
  stats: ProductStats;
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
  async getProducts(params: ProductsQuery = {}): Promise<ProductsResponse> {
    const response = await this.post<ProductsResponse>("/seller/products", {
      action: "list",
      ...params
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch products.",
      );
    }
  }

  // Get product statistics
  async getProductStats(period?: string): Promise<ProductStats> {
    const response = await this.post<ProductStatsResponse>("/seller/products", {
      action: "stats",
      period
    });

    if (response.success) {
      return response.data!.stats;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch product statistics.",
      );
    }
  }

  // Get single product by ID
  async getProductById(productId: string): Promise<SellerProduct> {
    const response = await this.post<{ product: SellerProduct }>("/seller/products", {
      action: "get_product",
      productId
    });

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
    const response = await this.post<{ message: string; product: SellerProduct }>("/seller/products", {
      action: "create",
      ...data
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to create product.",
      );
    }
  }

  // Update existing product
  async updateProduct(productId: string, data: UpdateProductRequest): Promise<{ message: string; product: SellerProduct }> {
    const response = await this.post<{ message: string; product: SellerProduct }>("/seller/products", {
      action: "update",
      productId,
      ...data
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to update product.",
      );
    }
  }

  // Update product status (publish/unpublish)
  async updateProductStatus(productId: string, isPublished: boolean): Promise<{ message: string }> {
    const response = await this.post<{ message: string }>("/seller/products", {
      action: "update_status",
      productId,
      isPublished
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to update product status.",
      );
    }
  }

  // Delete product
  async deleteProduct(productId: string): Promise<{ message: string }> {
    const response = await this.post<{ message: string }>("/seller/products", {
      action: "delete",
      productId
    });

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
    const response = await this.post<{ message: string; product: SellerProduct }>("/seller/products", {
      action: "duplicate",
      productId
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
    const response = await this.post<ProductAnalyticsResponse>("/seller/products", {
      action: "analytics",
      productId,
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

  // Get seller dashboard analytics
  async getDashboardAnalytics(period?: string): Promise<ProductAnalyticsResponse['analytics']> {
    const response = await this.post<ProductAnalyticsResponse>("/seller/products", {
      action: "dashboard_analytics",
      period
    });

    if (response.success) {
      return response.data!.analytics;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch dashboard analytics.",
      );
    }
  }

  // Export products
  async exportProducts(options: ExportOptions = {}): Promise<{ downloadUrl: string; message: string }> {
    const response = await this.post<{ downloadUrl: string; message: string }>("/seller/products", {
      action: "export",
      format: 'xlsx',
      ...options
    });

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
    const response = await this.post<{ message: string }>("/seller/products", {
      action: "update_inventory",
      productId,
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
    }>("/seller/products", {
      action: "get_reviews",
      productId,
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