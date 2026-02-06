import { BasePrivateService } from "../baseService";
import { 
  AdminProduct,
  AdminProductsQuery,
  AdminProductUpdate,
  AdminProductBulkUpdate,
  AdminProductStats
} from "@/types/adminProduct";

interface ProductsResponse {
  products: AdminProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class AdminProductsService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  // Get admin products with pagination and filters
  async getProducts(params: AdminProductsQuery = {}): Promise<ProductsResponse> {
    const response = await this.get<ProductsResponse>("/admin/products", params);

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch products.",
      );
    }
  }

  // Get product statistics
  async getProductStats(): Promise<AdminProductStats> {
    const response = await this.get<{ stats: AdminProductStats }>("/admin/products", { action: "stats" });

    if (response.success) {
      return response.data!.stats;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch product statistics.",
      );
    }
  }

  // Get single product by ID
  async getProductById(productId: string): Promise<AdminProduct> {
    const response = await this.get<{ product: AdminProduct }>(`/admin/products/${productId}`);

    if (response.success) {
      return response.data!.product;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch product.",
      );
    }
  }

  // Update product (approve/reject)
  async updateProduct(productId: string, data: AdminProductUpdate): Promise<AdminProduct> {
    const response = await this.patch<{ product: AdminProduct }>(`/admin/products/${productId}`, data);

    if (response.success) {
      return response.data!.product;
    } else {
      throw new Error(
        response.error?.message || "Failed to update product.",
      );
    }
  }

  // Delete product
  async deleteProduct(productId: string): Promise<void> {
    const response = await this.delete(`/admin/products/${productId}`);

    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to delete product.",
      );
    }
  }

  // Bulk update products
  async bulkUpdateProducts(data: AdminProductBulkUpdate): Promise<{ modifiedCount: number; message: string }> {
    const response = await this.patch<{ modifiedCount: number; message: string }>("/admin/products", {
      action: "bulk",
      ...data,
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to bulk update products.",
      );
    }
  }

  // Export products
  async exportProducts(options: any): Promise<any> {
    const response = await this.get("/admin/products", { action: "export", ...options });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to export products.",
      );
    }
  }
}

// Export singleton instance
export const adminProductsService = new AdminProductsService();