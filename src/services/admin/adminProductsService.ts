import { BasePrivateService } from "../baseService";
import type { 
  AdminProduct,
  ProductStats,
  BulkOperationResult,
  AdminProductsQueryRequest
} from "@/types/admin/products";
import { PaginationResult } from "@/lib/domain/shared/types";

class AdminProductsService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  async getProducts(params: Partial<AdminProductsQueryRequest> = {}): Promise<PaginationResult<AdminProduct>> {
    return await this.getPaginated<AdminProduct>("/admin/products", params);
  }

  async getProductStats(period?: string): Promise<ProductStats> {
    const params: any = { stats: "true" };
    if (period) params.period = period;
    
    const response = await this.get<ProductStats>("/admin/products", params);

    if (response.success) {
      return response.data as ProductStats;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch product statistics.",
      );
    }
  }

  async getProductById(productId: string): Promise<AdminProduct> {
    const response = await this.get<AdminProduct>(`/admin/products/${productId}`);

    if (response.success) {
      return response.data as AdminProduct;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch product.",
      );
    }
  }

  async updateProduct(productId: string, data: Partial<AdminProduct>): Promise<AdminProduct> {
    const response = await this.patch<AdminProduct>(`/admin/products/${productId}`, data);

    if (response.success) {
      return response.data as AdminProduct;
    } else {
      throw new Error(
        response.error?.message || "Failed to update product.",
      );
    }
  }

  async togglePublishProduct(productId: string, isPublished: boolean): Promise<AdminProduct> {
    const response = await this.post<AdminProduct>(`/admin/products/${productId}`, {
      action: isPublished ? "publish" : "unpublish"
    });

    if (response.success) {
      return response.data as AdminProduct;
    } else {
      throw new Error(
        response.error?.message || "Failed to update publish status.",
      );
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    const response = await this.delete(`/admin/products/${productId}`);

    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to delete product.",
      );
    }
  }

  async bulkUpdateProducts(data: { productIds: string[]; updates: Partial<AdminProduct> }): Promise<BulkOperationResult> {
    const response = await this.post<BulkOperationResult>("/admin/products", data);

    if (response.success) {
      return response.data as BulkOperationResult;
    } else {
      throw new Error(
        response.error?.message || "Failed to bulk update products.",
      );
    }
  }

  async bulkPublishProducts(productIds: string[], isPublished: boolean): Promise<BulkOperationResult> {
    const response = await this.post<BulkOperationResult>("/admin/products", {
      action: "publish",
      productIds,
      isPublished
    });

    if (response.success) {
      return response.data as BulkOperationResult;
    } else {
      throw new Error(
        response.error?.message || "Failed to bulk publish products.",
      );
    }
  }

  async bulkDeleteProducts(productIds: string[]): Promise<BulkOperationResult> {
    const response = await this.post<BulkOperationResult>("/admin/products", {
      action: "delete",
      productIds
    });

    if (response.success) {
      return response.data as BulkOperationResult;
    } else {
      throw new Error(
        response.error?.message || "Failed to bulk delete products.",
      );
    }
  }

  async exportProducts(options: { format?: string; filters?: any }): Promise<Blob> {
    const response = await this.get("/admin/products", { action: "export", ...options });

    if (response.success) {
      return new Blob([JSON.stringify(response.data)], { type: 'application/json' });
    } else {
      throw new Error(
        response.error?.message || "Failed to export products.",
      );
    }
  }
}

export const adminProductsService = new AdminProductsService();
