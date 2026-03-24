import { IAdminProductsRepository, AdminProduct, ProductStats, BulkOperationResult } from "./IAdminProductsRepository";
import { AdminProductsQueryRequest, ProductStatus } from "./AdminProductsSchemas";
import { PaginationResult } from "../../shared/types";
import { getStartDateFromPeriod } from "../../shared/dateUtils";
import Product from "@/models/Product";

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
      page = 1, limit = 10, search, status, period,
      sellerId, categoryId, subCategoryId, isPublished,
      sortBy = "createdAt", sortOrder = "desc", minPrice, maxPrice
    } = query;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      if (status === "PENDING") {
        filter.$or = [{ status: "PENDING" }, { status: { $exists: false } }, { status: null }];
      } else {
        filter.status = status;
      }
    }

    if (period) filter.createdAt = { $gte: getStartDateFromPeriod(period) };
    if (sellerId) filter.sellerId = sellerId;
    if (categoryId) filter.categoryId = categoryId;
    if (subCategoryId) filter.subCategoryId = subCategoryId;
    if (isPublished !== undefined) filter.isPublished = isPublished;

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

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
      data: products.map(p => this.mapToAdminProduct(p)),
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    };
  }

  async getStats(period: string): Promise<ProductStats> {
    const startDate = getStartDateFromPeriod(period);
    const f = { createdAt: { $gte: startDate } };

    const [total, pending, approved, rejected, published, unpublished, byCategory, bySeller, recentActivity] = await Promise.all([
      Product.countDocuments(f),
      Product.countDocuments({ ...f, $or: [{ status: "PENDING" }, { status: { $exists: false } }, { status: null }] }),
      Product.countDocuments({ ...f, status: "APPROVED" }),
      Product.countDocuments({ ...f, status: "REJECTED" }),
      Product.countDocuments({ ...f, isPublished: true }),
      Product.countDocuments({ ...f, isPublished: false }),
      Product.aggregate([
        { $match: f },
        { $group: { _id: '$categoryId', count: { $sum: 1 } } },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        { $project: { categoryId: { $toString: '$_id' }, categoryName: { $ifNull: ['$category.name', 'Uncategorized'] }, count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Product.aggregate([
        { $match: f },
        { $group: { _id: '$sellerId', count: { $sum: 1 } } },
        { $lookup: { from: 'sellers', localField: '_id', foreignField: '_id', as: 'seller' } },
        { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
        { $project: { sellerId: { $toString: '$_id' }, sellerName: { $ifNull: ['$seller.businessName', 'Unknown'] }, count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Product.find(f).sort({ createdAt: -1 }).limit(10).select('name status createdAt').lean()
    ]);

    return {
      total, pending, approved, rejected, published, unpublished,
      byCategory: byCategory.map((c: any) => ({ categoryId: c.categoryId, categoryName: c.categoryName, count: c.count })),
      bySeller: bySeller.map((s: any) => ({ sellerId: s.sellerId, sellerName: s.sellerName, count: s.count })),
      recentActivity: recentActivity.map((p: any) => ({
        productId: p._id.toString(),
        productName: p.name,
        action: p.status || 'PENDING',
        timestamp: p.createdAt,
      })),
    };
  }

  async updateStatus(productId: string, status: ProductStatus, reason?: string): Promise<AdminProduct> {
    const updateData: any = { status, updatedAt: new Date() };
    if (reason) updateData.rejectionReason = reason;

    const product = await Product.findByIdAndUpdate(productId, updateData, { new: true, runValidators: true })
      .populate("sellerId", "businessName email")
      .populate("categoryId", "name")
      .populate("subCategoryId", "name");

    if (!product) throw new Error("Product not found");
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

    if (!product) throw new Error("Product not found");
    return this.mapToAdminProduct(product.toObject());
  }

  async delete(productId: string): Promise<void> {
    const result = await Product.findByIdAndDelete(productId);
    if (!result) throw new Error("Product not found");
  }

  async bulkUpdateStatus(productIds: string[], status: ProductStatus, reason?: string): Promise<BulkOperationResult> {
    const updateData: any = { status, updatedAt: new Date() };
    if (reason) updateData.rejectionReason = reason;

    await Product.updateMany({ _id: { $in: productIds } }, updateData);

    const updated = await Product.find({ _id: { $in: productIds }, status }).select('_id').lean();
    const successIds = updated.map((p: any) => p._id.toString());
    const failedIds = productIds.filter(id => !successIds.includes(id));

    return {
      success: successIds,
      failed: failedIds.map(id => ({ id, error: 'Update failed or product not found' })),
      total: productIds.length,
      successCount: successIds.length,
      failedCount: failedIds.length,
    };
  }

  async bulkUpdatePublishStatus(productIds: string[], isPublished: boolean): Promise<BulkOperationResult> {
    const result = await Product.updateMany({ _id: { $in: productIds } }, { isPublished, updatedAt: new Date() });
    const failedCount = productIds.length - result.modifiedCount;

    return {
      success: productIds.slice(0, result.modifiedCount),
      failed: productIds.slice(result.modifiedCount).map(id => ({ id, error: 'Update failed' })),
      total: productIds.length,
      successCount: result.modifiedCount,
      failedCount,
    };
  }

  async bulkDelete(productIds: string[]): Promise<BulkOperationResult> {
    const result = await Product.deleteMany({ _id: { $in: productIds } });

    return {
      success: productIds.slice(0, result.deletedCount),
      failed: productIds.slice(result.deletedCount).map(id => ({ id, error: 'Delete failed' })),
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
    const trends = await Product.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $in: ['$status', ['PENDING', null]] }, 1, 0] } },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return trends.map((t: any) => ({
      date: t._id,
      total: t.total,
      approved: t.approved,
      rejected: t.rejected,
      pending: t.pending,
    }));
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
