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
    return await this.repository.findMany(query);
  }

  async getProductById(id: string): Promise<AdminProduct> {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new ProductNotFoundError(id);
    }
    return product;
  }

  async getProductStats(query: ProductStatsQueryRequest): Promise<ProductStats> {
    return await this.repository.getStats(query.period);
  }

  // Product management
  async approveProduct(request: ProductApprovalRequest): Promise<AdminProduct> {
    const product = await this.repository.findById(request.productId);
    if (!product) {
      throw new ProductNotFoundError(request.productId);
    }

    if (product.status === "APPROVED") {
      throw new ProductValidationError("status", "Product is already approved");
    }

    return await this.repository.updateStatus(request.productId, "APPROVED");
  }

  async rejectProduct(request: ProductApprovalRequest): Promise<AdminProduct> {
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
  }

  async updateProductStatus(request: ProductApprovalRequest): Promise<AdminProduct> {
    const product = await this.repository.findById(request.productId);
    if (!product) {
      throw new ProductNotFoundError(request.productId);
    }

    return await this.repository.updateStatus(request.productId, request.status, request.reason);
  }

  async updateProductPublishStatus(productId: string, isPublished: boolean): Promise<AdminProduct> {
    const product = await this.repository.findById(productId);
    if (!product) {
      throw new ProductNotFoundError(productId);
    }

    return await this.repository.updatePublishStatus(productId, isPublished);
  }

  async deleteProduct(productId: string): Promise<void> {
    const product = await this.repository.findById(productId);
    if (!product) {
      throw new ProductNotFoundError(productId);
    }

    await this.repository.delete(productId);
  }

  // Bulk operations
  async bulkApproveProducts(request: BulkProductApprovalRequest): Promise<BulkOperationResult> {
    if (request.productIds.length === 0) {
      throw new ProductValidationError("productIds", "At least one product ID is required");
    }

    const result = await this.repository.bulkUpdateStatus(request.productIds, "APPROVED");
    
    if (result.failedCount > 0) {
      throw new BulkOperationError("approve", result.failed.map(f => f.id), "Some products could not be approved");
    }

    return result;
  }

  async bulkRejectProducts(request: BulkProductApprovalRequest): Promise<BulkOperationResult> {
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
  }

  async bulkUpdateProductStatus(request: BulkProductApprovalRequest): Promise<BulkOperationResult> {
    if (request.productIds.length === 0) {
      throw new ProductValidationError("productIds", "At least one product ID is required");
    }

    const result = await this.repository.bulkUpdateStatus(request.productIds, request.status, request.reason);
    
    if (result.failedCount > 0) {
      throw new BulkOperationError("update status", result.failed.map(f => f.id), "Some products could not be updated");
    }

    return result;
  }

  async bulkToggleProductPublish(request: BulkProductPublishRequest): Promise<BulkOperationResult> {
    if (request.productIds.length === 0) {
      throw new ProductValidationError("productIds", "At least one product ID is required");
    }

    const result = await this.repository.bulkUpdatePublishStatus(request.productIds, request.isPublished);
    
    if (result.failedCount > 0) {
      throw new BulkOperationError("toggle publish", result.failed.map(f => f.id), "Some products could not be updated");
    }

    return result;
  }

  async bulkDeleteProducts(request: BulkProductDeleteRequest): Promise<BulkOperationResult> {
    if (request.productIds.length === 0) {
      throw new ProductValidationError("productIds", "At least one product ID is required");
    }

    const result = await this.repository.bulkDelete(request.productIds);
    
    if (result.failedCount > 0) {
      throw new BulkOperationError("delete", result.failed.map(f => f.id), "Some products could not be deleted");
    }

    return result;
  }
}

// Export singleton instance
export const adminProductsService = new AdminProductsService();