import Product from "@/models/Product";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import mongoose from "mongoose";
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
import { getStartDateFromPeriod } from "../../shared/dateUtils";
import type { ProductFilters, ProductStats, CreateProductData, UpdateProductData, BulkUpdateData } from "./ISellerProductsRepository";

export type { ProductFilters, ProductStats, CreateProductData, UpdateProductData, BulkUpdateData };

export class SellerProductsRepository {
  async findProducts(filters: ProductFilters) {
    const { sellerId, search, status, period = 'all', page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = filters;

    const query: Record<string, any> = {
      sellerId,
    };

    if (period) {
      const startDate = getStartDateFromPeriod(period);
      query.createdAt = { $gte: startDate };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { itemId: { $regex: search, $options: 'i' } }
      ];
    }

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

    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .populate('subCategoryId', 'name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(query);

    const formattedProducts = products.map((product: any) => ({
      ...product,
      id: product._id.toString(),
    }));

    return {
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      }
    };
  }

  async getProductStats(sellerId: string): Promise<ProductStats> {
    const stats = await Product.aggregate([
      { $match: { sellerId: new mongoose.Types.ObjectId(sellerId) } },
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
  }

  async findById(productId: string, sellerId: string) {
    const product: any = await Product.findOne({ _id: productId, sellerId })
      .populate('categoryId')
      .populate('subCategoryId')
      .populate('sellerId')
      .populate('approvedBy')
      .lean();

    if (!product) {
      throw new ProductNotFoundError(productId);
    }

    return {
      ...product,
      id: product._id.toString(),
    };
  }

  async create(sellerId: string, data: CreateProductData) {
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

    const product: any = await Product.create(productData);

    await invalidateProductCaches();

    return {
      ...product.toObject(),
      id: product._id.toString(),
    };
  }

  async update(productId: string, sellerId: string, data: UpdateProductData) {
    const product = await Product.findOne({ _id: productId, sellerId });
    if (!product) {
      throw new ProductNotFoundError(productId);
    }

    Object.assign(product, data);
    await product.save();

    await invalidateProductCaches(productId);

    const productObj: any = product.toObject();
    return {
      ...productObj,
      id: productObj._id.toString(),
    };
  }

  async delete(productId: string, sellerId: string) {
    const product = await Product.findOne({ _id: productId, sellerId });
    if (!product) {
      throw new ProductNotFoundError(productId);
    }

    const imagesToDelete: string[] = [];

    if (product.mainImage?.publicId) {
      imagesToDelete.push(product.mainImage.publicId);
    }

    if (product.galleryImages && product.galleryImages.length > 0) {
      product.galleryImages.forEach((img: any) => {
        if (img.publicId) {
          imagesToDelete.push(img.publicId);
        }
      });
    }

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

    await Product.findByIdAndDelete(productId);

    await invalidateProductCaches(productId);

    return true;
  }

  async duplicate(productId: string, sellerId: string) {
    const originalProduct: any = await Product.findOne({ _id: productId, sellerId }).lean();
    if (!originalProduct) {
      throw new ProductNotFoundError(productId);
    }

    const newItemId = generateUniqueItemId(originalProduct.name + ' Copy');
    const newSku = generateUniqueSKU(originalProduct.name + ' Copy');
    const newSlug = generateUniqueSlug(originalProduct.name + ' Copy');

    const duplicatedData = {
      ...originalProduct,
      _id: undefined,
      name: originalProduct.name + ' (Copy)',
      itemId: newItemId,
      sku: newSku,
      slug: newSlug,
      isPublished: false,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newProduct = await Product.create(duplicatedData);

    await invalidateProductCaches();

    return newProduct;
  }

  async bulkUpdate(sellerId: string, data: BulkUpdateData) {
    const { productIds, updates } = data;

    const products = await Product.find({
      _id: { $in: productIds },
      sellerId
    });

    if (products.length !== productIds.length) {
      throw new UnauthorizedProductAccessError('Some products not found or unauthorized');
    }

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
  }

  async bulkDelete(sellerId: string, productIds: string[]) {
    const products = await Product.find({
      _id: { $in: productIds },
      sellerId
    });

    if (products.length !== productIds.length) {
      throw new UnauthorizedProductAccessError('Some products not found or unauthorized');
    }

    const result = await Product.deleteMany({
      _id: { $in: productIds },
      sellerId
    });

    return {
      deletedCount: result.deletedCount,
      message: `${result.deletedCount} product(s) deleted successfully`
    };
  }

  async getProductsForExport(sellerId: string, search?: string, status?: string) {
    const query: any = { sellerId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

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

    const products = await Product.find(query)
      .select('name description originalPrice finalPrice inStockQuantity status isPublished createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();

    return products;
  }

  async updateProductStatus(productId: string, sellerId: string, isPublished: boolean) {
    const product = await Product.findOne({ _id: productId, sellerId });
    if (!product) {
      throw new ProductNotFoundError(productId);
    }

    product.isPublished = isPublished;
    await product.save();

    await invalidateProductCaches(productId);

    const productObj: any = product.toObject();
    return {
      ...productObj,
      id: productObj._id.toString(),
    };
  }
}

export const sellerProductsRepository = new SellerProductsRepository();