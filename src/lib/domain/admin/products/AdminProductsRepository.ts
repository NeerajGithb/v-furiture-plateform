import { IAdminProductsRepository, AdminProduct, ProductStats, BulkOperationResult } from "./IAdminProductsRepository";
import { AdminProductsQueryRequest, ProductStatus } from "./AdminProductsSchemas";
import { PaginationResult } from "../../shared/types";
import { getStartDateFromPeriod } from "../../shared/dateUtils";
import { mapDocumentToPlainObject, mapDocumentsToPlainObjects } from "../../shared/mapperUtils";
import Product from "@/models/Product";
import Seller from "@/models/Seller";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";

export class AdminProductsRepository implements IAdminProductsRepository {
  async findById(id: string): Promise<AdminProduct | null> {
      const product = await Product.findById(id)
        .populate("sellerId", "businessName email")
        .populate("categoryId", "name")
        .populate("subCategoryId", "name")
        .lean();

      return product ? this.mapToAdminProduct(product) : null;
  }

  async findMany(query: AdminProductsQueryRequest): Promise<PaginationResult<AdminProduct>> {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        status, 
        period,
        sellerId, 
        categoryId, 
        subCategoryId, 
        isPublished, 
        sortBy = "createdAt", 
        sortOrder = "desc", 
        minPrice, 
        maxPrice 
      } = query;
      
      // Build filter
      const filter: any = {};
      
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }
      
      if (status) {
        if (status === "PENDING") {
          filter.$or = [
            { status: "PENDING" },
            { status: { $exists: false } },
            { status: null }
          ];
        } else {
          filter.status = status;
        }
      }
      
      // Period filter
      if (period) {
        const startDate = getStartDateFromPeriod(period);
        filter.createdAt = { $gte: startDate };
      }
      
      if (sellerId) filter.sellerId = sellerId;
      if (categoryId) filter.categoryId = categoryId;
      if (subCategoryId) filter.subCategoryId = subCategoryId;
      if (isPublished !== undefined) filter.isPublished = isPublished;
      
      if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined) filter.price.$gte = minPrice;
        if (maxPrice !== undefined) filter.price.$lte = maxPrice;
      }

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;

      // Execute queries
      const [products, total] = await Promise.all([
        Product.find(filter)
          .populate("sellerId", "businessName email")
          .populate("categoryId", "name")
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Product.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: products.map(product => this.mapToAdminProduct(product)),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
  }

  async getStats(period: string): Promise<ProductStats> {
      const startDate = getStartDateFromPeriod(period);
      const periodFilter = { createdAt: { $gte: startDate } };

      const [
        total,
        pending,
        approved,
        rejected,
        published,
        unpublished
      ] = await Promise.all([
        Product.countDocuments(periodFilter),
        Product.countDocuments({ ...periodFilter, $or: [{ status: "PENDING" }, { status: { $exists: false } }, { status: null }] }),
        Product.countDocuments({ ...periodFilter, status: "APPROVED" }),
        Product.countDocuments({ ...periodFilter, status: "REJECTED" }),
        Product.countDocuments({ ...periodFilter, isPublished: true }),
        Product.countDocuments({ ...periodFilter, isPublished: false })
      ]);

      return {
        total,
        pending,
        approved,
        rejected,
        published,
        unpublished,
        byCategory: [],
        bySeller: [],
        recentActivity: [],
      };
  }

  async updateStatus(productId: string, status: ProductStatus, reason?: string): Promise<AdminProduct> {
      const updateData: any = { status, updatedAt: new Date() };
      if (reason) updateData.rejectionReason = reason;

      const product = await Product.findByIdAndUpdate(
        productId,
        updateData,
        { new: true, runValidators: true }
      )
        .populate("sellerId", "businessName email")
        .populate("categoryId", "name")
        .populate("subCategoryId", "name");

      if (!product) {
        throw new Error("Product not found");
      }

      return this.mapToAdminProduct(product.toObject());
  }

  async updatePublishStatus(productId: string, isPublished: boolean): Promise<AdminProduct> {
      const product = await Product.findByIdAndUpdate(
        productId,
        { isPublished, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
        .populate("sellerId", "businessName email")
        .populate("categoryId", "name")
        .populate("subCategoryId", "name");

      if (!product) {
        throw new Error("Product not found");
      }

      return this.mapToAdminProduct(product.toObject());
  }

  async delete(productId: string): Promise<void> {
      const result = await Product.findByIdAndDelete(productId);
      if (!result) {
        throw new Error("Product not found");
      }
  }

  async bulkUpdateStatus(productIds: string[], status: ProductStatus, reason?: string): Promise<BulkOperationResult> {
      const updateData: any = { status, updatedAt: new Date() };
      if (reason) updateData.rejectionReason = reason;

      const result = await Product.updateMany(
        { _id: { $in: productIds } },
        updateData
      );

      return {
        success: productIds, // Simplified - in reality you'd track individual successes
        failed: [],
        total: productIds.length,
        successCount: result.modifiedCount,
        failedCount: productIds.length - result.modifiedCount,
      };
  }

  async bulkUpdatePublishStatus(productIds: string[], isPublished: boolean): Promise<BulkOperationResult> {
      const result = await Product.updateMany(
        { _id: { $in: productIds } },
        { isPublished, updatedAt: new Date() }
      );

      return {
        success: productIds,
        failed: [],
        total: productIds.length,
        successCount: result.modifiedCount,
        failedCount: productIds.length - result.modifiedCount,
      };
  }

  async bulkDelete(productIds: string[]): Promise<BulkOperationResult> {
      const result = await Product.deleteMany({ _id: { $in: productIds } });

      return {
        success: productIds,
        failed: [],
        total: productIds.length,
        successCount: result.deletedCount,
        failedCount: productIds.length - result.deletedCount,
      };
  }

  async getProductTrends(startDate: Date, endDate: Date): Promise<Array<{
    date: string;
    total: number;
    approved: number;
    rejected: number;
    pending: number;
  }>> {
      // Simplified implementation
      return [];
  }

  private mapToAdminProduct(product: any): AdminProduct {
    return {
      id: product._id?.toString() || product.id,
      name: product.name,
      description: product.description || "",
      price: product.finalPrice || product.originalPrice || 0,
      images: product.galleryImages?.map((img: any) => img.url) || [],
      status: product.status || "PENDING",
      isPublished: product.isPublished || false,
      sellerId: {
        id: product.sellerId?._id?.toString() || product.sellerId?.id || product.sellerId,
        businessName: product.sellerId?.businessName || "",
        email: product.sellerId?.email || "",
      },
      categoryId: {
        id: product.categoryId?._id?.toString() || product.categoryId?.id || product.categoryId,
        name: product.categoryId?.name || "",
      },
      subCategoryId: product.subCategoryId ? {
        id: product.subCategoryId._id?.toString() || product.subCategoryId.id || product.subCategoryId,
        name: product.subCategoryId.name || "",
      } : undefined,
      stock: product.inStockQuantity || 0,
      sku: product.sku || "",
      rejectionReason: product.rejectionReason,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
