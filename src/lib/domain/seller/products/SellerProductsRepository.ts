import Product from "@/models/Product";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import { 
  ProductNotFoundError, 
  ProductsFetchError, 
  ProductCreateError, 
  ProductUpdateError, 
  ProductDeleteError,
  UnauthorizedProductAccessError,
  BulkProductUpdateError,
  ProductExportError
} from "./SellerProductsErrors";
import { generateUniqueSKU, generateUniqueSlug, generateUniqueItemId } from "@/utils/productUtils";
import cloudinary from "@/lib/upload/cloudinary";
import { invalidateProductCaches } from "@/lib/cache/invalidateClientCache";

export interface ProductFilters {
  sellerId: string;
  search?: string;
  status?: string;
  period?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductStats {
  total: number;
  published: number;
  draft: number;
  outOfStock: number;
  lowStock: number;
  pending: number;
  approved: number;
  rejected: number;
  totalViews: number;
  totalSold: number;
  totalWishlisted: number;
}

export interface CreateProductData {
  name: string;
  description: string;
  categoryId: string;
  subCategoryId?: string;
  originalPrice: number;
  finalPrice: number;
  discountPercent?: number;
  inStockQuantity: number;
  mainImage: {
    url: string;
    publicId: string;
  };
  galleryImages?: Array<{
    url: string;
    publicId: string;
  }>;
  sku?: string;
  isPublished?: boolean;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  categoryId?: string;
  subCategoryId?: string;
  originalPrice?: number;
  finalPrice?: number;
  discountPercent?: number;
  inStockQuantity?: number;
  mainImage?: {
    url: string;
    publicId: string;
  };
  galleryImages?: Array<{
    url: string;
    publicId: string;
  }>;
  isPublished?: boolean;
}

export interface BulkUpdateData {
  productIds: string[];
  updates: {
    isPublished?: boolean;
    status?: string;
    inStockQuantity?: number;
    finalPrice?: number;
  };
}

export class SellerProductsRepository {
  // Helper function to get date filter based on period
  private getDateFilter(period: string) {
    const now = new Date();
    let startDate: Date | null = null;

    switch (period) {
      case '30min':
        startDate = new Date(now.getTime() - 30 * 60 * 1000);
        break;
      case '1hour':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '1day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
      default:
        return {};
    }

    return startDate ? { createdAt: { $gte: startDate } } : {};
  }

  async findProducts(filters: ProductFilters) {
    try {
      const { sellerId, search, status, period = 'all', page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = filters;

      // Get date filter for the period
      const dateFilter = this.getDateFilter(period);

      // Build query with date filter and search
      const query: Record<string, any> = {
        sellerId,
        ...dateFilter
      };

      // Add search filter if provided
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
          { itemId: { $regex: search, $options: 'i' } }
        ];
      }

      // Add status filter
      if (status) {
        switch (status) {
          case 'published':
            query.isPublished = true;
            break;
          case 'draft':
            query.isPublished = false;
            break;
          case 'outOfStock':
            query.inStockQuantity = 0;
            break;
          case 'lowStock':
            query.inStockQuantity = { $gt: 0, $lte: 10 };
            break;
          case 'pending':
            query.status = 'PENDING';
            break;
          case 'approved':
            query.status = 'APPROVED';
            break;
          case 'rejected':
            query.status = 'REJECTED';
            break;
        }
      }

      // Build sort object
      const sort: Record<string, 1 | -1> = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Fetch products for this seller with filtering
      const products = await Product.find(query)
        .populate('categoryId', 'name')
        .populate('subCategoryId', 'name')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      // Get total count for pagination
      const total = await Product.countDocuments(query);

      return {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        }
      };
    } catch (error) {
      throw new ProductsFetchError(`Failed to fetch products: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getProductStats(sellerId: string): Promise<ProductStats> {
    try {
      const stats = await Product.aggregate([
        { $match: { sellerId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            published: {
              $sum: { $cond: [{ $eq: ['$isPublished', true] }, 1, 0] }
            },
            draft: {
              $sum: { $cond: [{ $eq: ['$isPublished', false] }, 1, 0] }
            },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] }
            },
            approved: {
              $sum: { $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0] }
            },
            rejected: {
              $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] }
            },
            lowStock: {
              $sum: {
                $cond: [
                  { $and: [{ $gte: ['$inStockQuantity', 1] }, { $lte: ['$inStockQuantity', 10] }] },
                  1,
                  0
                ]
              }
            },
            outOfStock: {
              $sum: { $cond: [{ $lte: ['$inStockQuantity', 0] }, 1, 0] }
            },
            totalViews: { $sum: { $ifNull: ['$viewCount', 0] } },
            totalSold: { $sum: { $ifNull: ['$totalSold', 0] } },
            totalWishlisted: { $sum: { $ifNull: ['$wishlistCount', 0] } }
          }
        }
      ]);

      return stats[0] || {
        total: 0,
        published: 0,
        draft: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        lowStock: 0,
        outOfStock: 0,
        totalViews: 0,
        totalSold: 0,
        totalWishlisted: 0
      };
    } catch (error) {
      throw new ProductsFetchError(`Failed to fetch product stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(productId: string, sellerId: string) {
    try {
      const product = await Product.findOne({ _id: productId, sellerId })
        .populate('categoryId')
        .populate('subCategoryId')
        .populate('sellerId')
        .populate('approvedBy')
        .lean();

      if (!product) {
        throw new ProductNotFoundError(productId);
      }

      return product;
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        throw error;
      }
      throw new ProductsFetchError(`Failed to fetch product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async create(sellerId: string, data: CreateProductData) {
    try {
      // Generate unique identifiers
      const itemId = generateUniqueItemId(data.name);
      const sku = data.sku || generateUniqueSKU(data.name);
      const slug = generateUniqueSlug(data.name);

      const productData = {
        ...data,
        sellerId,
        itemId,
        sku,
        slug,
        status: 'PENDING',
        isActive: true,
      };

      // Create product
      const product = await Product.create(productData);

      // Invalidate client cache
      await invalidateProductCaches();

      return product;
    } catch (error) {
      throw new ProductCreateError(`Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async update(productId: string, sellerId: string, data: UpdateProductData) {
    try {
      const product = await Product.findOne({ _id: productId, sellerId });
      if (!product) {
        throw new ProductNotFoundError(productId);
      }

      // Update product with all fields from data
      Object.assign(product, data);
      await product.save();

      // Invalidate client cache
      await invalidateProductCaches(productId);

      return product;
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        throw error;
      }
      throw new ProductUpdateError(`Failed to update product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(productId: string, sellerId: string) {
    try {
      const product = await Product.findOne({ _id: productId, sellerId });
      if (!product) {
        throw new ProductNotFoundError(productId);
      }

      // Collect all image public IDs to delete
      const imagesToDelete: string[] = [];

      // Add main image publicId
      if (product.mainImage?.publicId) {
        imagesToDelete.push(product.mainImage.publicId);
      }

      // Add gallery images publicIds
      if (product.galleryImages && product.galleryImages.length > 0) {
        product.galleryImages.forEach((img: any) => {
          if (img.publicId) {
            imagesToDelete.push(img.publicId);
          }
        });
      }

      // Delete images from Cloudinary
      if (imagesToDelete.length > 0) {
        const deletePromises = imagesToDelete.map(async (publicId) => {
          try {
            await cloudinary.uploader.destroy(publicId);
            return true;
          } catch (error) {
            return null;
          }
        });

        await Promise.all(deletePromises);
      }

      // Delete product from database
      await Product.findByIdAndDelete(productId);

      // Invalidate client cache
      await invalidateProductCaches(productId);

      return true;
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        throw error;
      }
      throw new ProductDeleteError(`Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async bulkUpdate(sellerId: string, data: BulkUpdateData) {
    try {
      const { productIds, updates } = data;

      // Verify all products belong to the seller
      const products = await Product.find({
        _id: { $in: productIds },
        sellerId
      });

      if (products.length !== productIds.length) {
        throw new UnauthorizedProductAccessError('Some products not found or unauthorized');
      }

      // Perform bulk update
      const result = await Product.updateMany(
        {
          _id: { $in: productIds },
          sellerId
        },
        {
          $set: {
            ...updates,
            updatedAt: new Date()
          }
        }
      );

      return {
        updatedCount: result.modifiedCount,
        message: `${result.modifiedCount} product(s) updated successfully`
      };
    } catch (error) {
      if (error instanceof UnauthorizedProductAccessError) {
        throw error;
      }
      throw new BulkProductUpdateError(`Failed to bulk update products: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getProductsForExport(sellerId: string, search?: string, status?: string) {
    try {
      // Build query
      const query: any = { sellerId };

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      if (status && status !== 'all') {
        switch (status) {
          case 'published':
            query.isPublished = true;
            break;
          case 'draft':
            query.isPublished = false;
            break;
          case 'outOfStock':
            query.inStockQuantity = 0;
            break;
          case 'lowStock':
            query.inStockQuantity = { $gt: 0, $lte: 10 };
            break;
          case 'pending':
            query.status = 'PENDING';
            break;
          case 'approved':
            query.status = 'APPROVED';
            break;
          case 'rejected':
            query.status = 'REJECTED';
            break;
        }
      }

      // Get products for export
      const products = await Product.find(query)
        .select('name description originalPrice finalPrice inStockQuantity status isPublished createdAt updatedAt')
        .sort({ createdAt: -1 })
        .lean();

      return products;
    } catch (error) {
      throw new ProductExportError(`Failed to get products for export: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateProductStatus(productId: string, sellerId: string, isPublished: boolean) {
    try {
      const product = await Product.findOne({ _id: productId, sellerId });
      if (!product) {
        throw new ProductNotFoundError(productId);
      }

      product.isPublished = isPublished;
      await product.save();

      // Invalidate client cache
      await invalidateProductCaches(productId);

      return product;
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        throw error;
      }
      console.error("Error updating product status:", error);
      throw new ProductUpdateError("Failed to update product status");
    }
  }
}

export const sellerProductsRepository = new SellerProductsRepository();