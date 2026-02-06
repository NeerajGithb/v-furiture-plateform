import { IAdminProductsRepository, AdminProduct, ProductStats, BulkOperationResult } from "./IAdminProductsRepository";
import { AdminProductsRepository } from "./AdminProductsRepository";
import { 
  AdminProductsQueryRequest,
  ProductApprovalRequest,
  BulkProductApprovalRequest,
  BulkProductPublishRequest,
  BulkProductDeleteRequest,
  ProductStatsQueryRequest
} from "./AdminProductsSchemas";
import {
  ProductNotFoundError,
  ProductValidationError,
  ProductOperationError,
  BulkOperationError,
} from "./AdminProductsErrors";
import { PaginationResult } from "../../shared/types";

export class AdminProductsService {
  constructor(
    private repository: IAdminProductsRepository = new AdminProductsRepository(),
  ) {}

  // Product queries
  async getProducts(query: AdminProductsQueryRequest): Promise<PaginationResult<AdminProduct>> {
    try {
      return await this.repository.findMany(query);
    } catch (error) {
      throw new ProductOperationError("getProducts", (error as Error).message);
    }
  }

  async getProductById(id: string): Promise<AdminProduct> {
    try {
      const product = await this.repository.findById(id);
      if (!product) {
        throw new ProductNotFoundError(id);
      }
      return product;
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        throw error;
      }
      throw new ProductOperationError("getProductById", (error as Error).message);
    }
  }

  async getProductStats(query: ProductStatsQueryRequest): Promise<ProductStats> {
    try {
      return await this.repository.getStats(query.period);
    } catch (error) {
      throw new ProductOperationError("getProductStats", (error as Error).message);
    }
  }

  // Product management
  async approveProduct(request: ProductApprovalRequest): Promise<AdminProduct> {
    try {
      const product = await this.repository.findById(request.productId);
      if (!product) {
        throw new ProductNotFoundError(request.productId);
      }

      if (product.status === "APPROVED") {
        throw new ProductValidationError("status", "Product is already approved");
      }

      return await this.repository.updateStatus(request.productId, "APPROVED");
    } catch (error) {
      if (error instanceof ProductNotFoundError || error instanceof ProductValidationError) {
        throw error;
      }
      throw new ProductOperationError("approveProduct", (error as Error).message);
    }
  }

  async rejectProduct(request: ProductApprovalRequest): Promise<AdminProduct> {
    try {
      const product = await this.repository.findById(request.productId);
      if (!product) {
        throw new ProductNotFoundError(request.productId);
      }

      if (product.status === "REJECTED") {
        throw new ProductValidationError("status", "Product is already rejected");
      }

      if (!request.reason) {
        throw new ProductValidationError("reason", "Rejection reason is required");
      }

      return await this.repository.updateStatus(request.productId, "REJECTED", request.reason);
    } catch (error) {
      if (error instanceof ProductNotFoundError || error instanceof ProductValidationError) {
        throw error;
      }
      throw new ProductOperationError("rejectProduct", (error as Error).message);
    }
  }

  async updateProductStatus(request: ProductApprovalRequest): Promise<AdminProduct> {
    try {
      const product = await this.repository.findById(request.productId);
      if (!product) {
        throw new ProductNotFoundError(request.productId);
      }

      return await this.repository.updateStatus(request.productId, request.status, request.reason);
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        throw error;
      }
      throw new ProductOperationError("updateProductStatus", (error as Error).message);
    }
  }

  async updateProductPublishStatus(productId: string, isPublished: boolean): Promise<AdminProduct> {
    try {
      const product = await this.repository.findById(productId);
      if (!product) {
        throw new ProductNotFoundError(productId);
      }

      return await this.repository.updatePublishStatus(productId, isPublished);
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        throw error;
      }
      throw new ProductOperationError("updateProductPublishStatus", (error as Error).message);
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      const product = await this.repository.findById(productId);
      if (!product) {
        throw new ProductNotFoundError(productId);
      }

      await this.repository.delete(productId);
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        throw error;
      }
      throw new ProductOperationError("deleteProduct", (error as Error).message);
    }
  }

  // Bulk operations
  async bulkApproveProducts(request: BulkProductApprovalRequest): Promise<BulkOperationResult> {
    try {
      if (request.productIds.length === 0) {
        throw new ProductValidationError("productIds", "At least one product ID is required");
      }

      const result = await this.repository.bulkUpdateStatus(request.productIds, "APPROVED");
      
      if (result.failedCount > 0) {
        throw new BulkOperationError("approve", result.failed.map(f => f.id), "Some products could not be approved");
      }

      return result;
    } catch (error) {
      if (error instanceof ProductValidationError || error instanceof BulkOperationError) {
        throw error;
      }
      throw new ProductOperationError("bulkApproveProducts", (error as Error).message);
    }
  }

  async bulkRejectProducts(request: BulkProductApprovalRequest): Promise<BulkOperationResult> {
    try {
      if (request.productIds.length === 0) {
        throw new ProductValidationError("productIds", "At least one product ID is required");
      }

      if (!request.reason) {
        throw new ProductValidationError("reason", "Rejection reason is required for bulk rejection");
      }

      const result = await this.repository.bulkUpdateStatus(request.productIds, "REJECTED", request.reason);
      
      if (result.failedCount > 0) {
        throw new BulkOperationError("reject", result.failed.map(f => f.id), "Some products could not be rejected");
      }

      return result;
    } catch (error) {
      if (error instanceof ProductValidationError || error instanceof BulkOperationError) {
        throw error;
      }
      throw new ProductOperationError("bulkRejectProducts", (error as Error).message);
    }
  }

  async bulkUpdateProductStatus(request: BulkProductApprovalRequest): Promise<BulkOperationResult> {
    try {
      if (request.productIds.length === 0) {
        throw new ProductValidationError("productIds", "At least one product ID is required");
      }

      const result = await this.repository.bulkUpdateStatus(request.productIds, request.status, request.reason);
      
      if (result.failedCount > 0) {
        throw new BulkOperationError("update status", result.failed.map(f => f.id), "Some products could not be updated");
      }

      return result;
    } catch (error) {
      if (error instanceof ProductValidationError || error instanceof BulkOperationError) {
        throw error;
      }
      throw new ProductOperationError("bulkUpdateProductStatus", (error as Error).message);
    }
  }

  async bulkToggleProductPublish(request: BulkProductPublishRequest): Promise<BulkOperationResult> {
    try {
      if (request.productIds.length === 0) {
        throw new ProductValidationError("productIds", "At least one product ID is required");
      }

      const result = await this.repository.bulkUpdatePublishStatus(request.productIds, request.isPublished);
      
      if (result.failedCount > 0) {
        throw new BulkOperationError("toggle publish", result.failed.map(f => f.id), "Some products could not be updated");
      }

      return result;
    } catch (error) {
      if (error instanceof ProductValidationError || error instanceof BulkOperationError) {
        throw error;
      }
      throw new ProductOperationError("bulkToggleProductPublish", (error as Error).message);
    }
  }

  async bulkDeleteProducts(request: BulkProductDeleteRequest): Promise<BulkOperationResult> {
    try {
      if (request.productIds.length === 0) {
        throw new ProductValidationError("productIds", "At least one product ID is required");
      }

      const result = await this.repository.bulkDelete(request.productIds);
      
      if (result.failedCount > 0) {
        throw new BulkOperationError("delete", result.failed.map(f => f.id), "Some products could not be deleted");
      }

      return result;
    } catch (error) {
      if (error instanceof ProductValidationError || error instanceof BulkOperationError) {
        throw error;
      }
      throw new ProductOperationError("bulkDeleteProducts", (error as Error).message);
    }
  }
}

// Export singleton instance
export const adminProductsService = new AdminProductsService();