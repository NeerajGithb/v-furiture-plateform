import { IAdminProductsRepository, AdminProduct, ProductStats, BulkOperationResult } from "./IAdminProductsRepository";
import { AdminProductsQueryRequest, ProductStatus } from "./AdminProductsSchemas";
import { PaginationResult } from "../../shared/types";
import { RepositoryError } from "../../shared/InfrastructureError";
import { mapDocumentToPlainObject, mapDocumentsToPlainObjects } from "../../shared/mapperUtils";
import Product from "@/models/Product";
import Seller from "@/models/Seller";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";

export class AdminProductsRepository implements IAdminProductsRepository {
  async findById(id: string): Promise<AdminProduct | null> {
    try {
      const product = await Product.findById(id)
        .populate("sellerId", "businessName email")
        .populate("categoryId", "name")
        .populate("subCategoryId", "name")
        .lean();

      return product ? this.mapToAdminProduct(product) : null;
    } catch (error) {
      throw new RepositoryError("Failed to find product by ID", "findById", error as Error);
    }
  }

  async findMany(query: AdminProductsQueryRequest): Promise<PaginationResult<AdminProduct>> {
    try {
      const { page, limit, search, status, sellerId, categoryId, subCategoryId, isPublished, sortBy, sortOrder, minPrice, maxPrice } = query;
      
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
          .populate("subCategoryId", "name")
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
    } catch (error) {
      throw new RepositoryError("Failed to find products", "findMany", error as Error);
    }
  }

  async getStats(period: string): Promise<ProductStats> {
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "1y":
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const [
        total,
        pending,
        approved,
        rejected,
        published,
        unpublished,
        byCategory,
        bySeller
      ] = await Promise.all([
        Product.countDocuments(),
        Product.countDocuments({ $or: [{ status: "PENDING" }, { status: { $exists: false } }, { status: null }] }),
        Product.countDocuments({ status: "APPROVED" }),
        Product.countDocuments({ status: "REJECTED" }),
        Product.countDocuments({ isPublished: true }),
        Product.countDocuments({ isPublished: false }),
        Product.aggregate([
          { $lookup: { from: "categories", localField: "categoryId", foreignField: "_id", as: "category" } },
          { $unwind: "$category" },
          { $group: { _id: "$categoryId", categoryName: { $first: "$category.name" }, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),
        Product.aggregate([
          { $lookup: { from: "sellers", localField: "sellerId", foreignField: "_id", as: "seller" } },
          { $unwind: "$seller" },
          { $group: { _id: "$sellerId", sellerName: { $first: "$seller.businessName" }, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ])
      ]);

      return {
        total,
        pending,
        approved,
        rejected,
        published,
        unpublished,
        byCategory: byCategory.map((item: any) => ({
          categoryId: item._id.toString(),
          categoryName: item.categoryName,
          count: item.count,
        })),
        bySeller: bySeller.map((item: any) => ({
          sellerId: item._id.toString(),
          sellerName: item.sellerName,
          count: item.count,
        })),
        recentActivity: [], // Simplified for now
      };
    } catch (error) {
      throw new RepositoryError("Failed to get product stats", "getStats", error as Error);
    }
  }

  async updateStatus(productId: string, status: ProductStatus, reason?: string): Promise<AdminProduct> {
    try {
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
    } catch (error) {
      throw new RepositoryError("Failed to update product status", "updateStatus", error as Error);
    }
  }

  async updatePublishStatus(productId: string, isPublished: boolean): Promise<AdminProduct> {
    try {
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
    } catch (error) {
      throw new RepositoryError("Failed to update product publish status", "updatePublishStatus", error as Error);
    }
  }

  async delete(productId: string): Promise<void> {
    try {
      const result = await Product.findByIdAndDelete(productId);
      if (!result) {
        throw new Error("Product not found");
      }
    } catch (error) {
      throw new RepositoryError("Failed to delete product", "delete", error as Error);
    }
  }

  async bulkUpdateStatus(productIds: string[], status: ProductStatus, reason?: string): Promise<BulkOperationResult> {
    try {
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
    } catch (error) {
      throw new RepositoryError("Failed to bulk update product status", "bulkUpdateStatus", error as Error);
    }
  }

  async bulkUpdatePublishStatus(productIds: string[], isPublished: boolean): Promise<BulkOperationResult> {
    try {
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
    } catch (error) {
      throw new RepositoryError("Failed to bulk update publish status", "bulkUpdatePublishStatus", error as Error);
    }
  }

  async bulkDelete(productIds: string[]): Promise<BulkOperationResult> {
    try {
      const result = await Product.deleteMany({ _id: { $in: productIds } });

      return {
        success: productIds,
        failed: [],
        total: productIds.length,
        successCount: result.deletedCount,
        failedCount: productIds.length - result.deletedCount,
      };
    } catch (error) {
      throw new RepositoryError("Failed to bulk delete products", "bulkDelete", error as Error);
    }
  }

  async getProductTrends(startDate: Date, endDate: Date): Promise<Array<{
    date: string;
    total: number;
    approved: number;
    rejected: number;
    pending: number;
  }>> {
    try {
      // Simplified implementation
      return [];
    } catch (error) {
      throw new RepositoryError("Failed to get product trends", "getProductTrends", error as Error);
    }
  }

  private mapToAdminProduct(product: any): AdminProduct {
    return {
      id: product._id?.toString() || product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      images: product.images || [],
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
      stock: product.stock || 0,
      sku: product.sku || "",
      rejectionReason: product.rejectionReason,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}