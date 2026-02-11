import Product from "@/models/Product";
import { getStartDateFromPeriod } from "@/lib/domain/shared/dateUtils";
import { 
  InventoryFetchError, 
  InventoryItemNotFoundError, 
  InventoryUpdateError,
  BulkUpdateError,
  InventoryExportError 
} from "./SellerInventoryErrors";

export class SellerInventoryRepository {
  private buildQuery(sellerId: string, filters: {
    search?: string;
    status?: string;
    period?: string;
  }) {
    const ObjectId = require('mongoose').Types.ObjectId;
    const sellerObjectId = new ObjectId(sellerId);

    const query: Record<string, any> = { 
      sellerId: sellerObjectId
    };

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { sku: { $regex: filters.search, $options: 'i' } }
      ];
    }

    if (filters.period) {
      const startDate = getStartDateFromPeriod(filters.period);
      query.createdAt = { $gte: startDate };
    }

    if (filters.status === 'in_stock') {
      query.inStockQuantity = { $gt: 10 };
    } else if (filters.status === 'low_stock') {
      query.inStockQuantity = { $gte: 1, $lte: 10 };
    } else if (filters.status === 'out_of_stock') {
      query.inStockQuantity = { $lte: 0 };
    }

    return query;
  }

  async getInventoryList(sellerId: string, options: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    period?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const { page, limit, sortBy = 'updatedAt', sortOrder = 'desc' } = options;
    const query = this.buildQuery(sellerId, options);

    const [products, total] = await Promise.all([
      Product.find(query)
        .select('name mainImage inStockQuantity originalPrice finalPrice status sku reorderLevel createdAt updatedAt')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);

    const inventory = products.map((product: any) => {
      const stockQuantity = product.inStockQuantity || 0;
      const reorderLevel = product.reorderLevel || 10;
      
      return {
        id: product._id.toString(),
        productId: {
          id: product._id.toString(),
          name: product.name,
          mainImage: product.mainImage
        },
        sku: product.sku || 'N/A',
        currentStock: stockQuantity,
        reservedStock: 0,
        availableStock: stockQuantity,
        reorderLevel: reorderLevel,
        maxStock: 1000,
        status: stockQuantity === 0 ? 'out_of_stock' : 
                stockQuantity <= reorderLevel ? 'low_stock' : 'in_stock',
        lastRestocked: product.updatedAt,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
    });

    return {
      inventory,
      total
    };
  }

  async getInventoryStats(sellerId: string, filters: {
    search?: string;
    status?: string;
    period?: string;
  } = {}) {
    const query = this.buildQuery(sellerId, filters);

    const stats = await Product.aggregate([
      { $match: query },
      {
        $addFields: {
          stockQuantity: { $ifNull: ['$inStockQuantity', 0] },
          price: { $ifNull: ['$finalPrice', 0] },
          reorderLvl: { $ifNull: ['$reorderLevel', 10] }
        }
      },
      {
        $addFields: {
          stockStatus: {
            $cond: [
              { $lte: ['$stockQuantity', 0] }, 'out_of_stock',
              { $cond: [
                { $lte: ['$stockQuantity', '$reorderLvl'] }, 'low_stock',
                'in_stock'
              ]}
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          inStock: {
            $sum: {
              $cond: [{ $eq: ['$stockStatus', 'in_stock'] }, 1, 0]
            }
          },
          lowStock: {
            $sum: {
              $cond: [{ $eq: ['$stockStatus', 'low_stock'] }, 1, 0]
            }
          },
          outOfStock: {
            $sum: {
              $cond: [{ $eq: ['$stockStatus', 'out_of_stock'] }, 1, 0]
            }
          },
          discontinued: {
            $sum: {
              $cond: [{ $eq: ['$status', 'UNPUBLISHED'] }, 1, 0]
            }
          },
          totalValue: {
            $sum: {
              $multiply: ['$stockQuantity', '$price']
            }
          },
          totalQuantity: { $sum: '$stockQuantity' },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);

    return stats[0] || {
      total: 0,
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      discontinued: 0,
      totalValue: 0,
      totalQuantity: 0,
      avgPrice: 0
    };
  }

  async getInventoryItem(sellerId: string, productId: string) {
    const product: any = await Product.findOne({ _id: productId, sellerId })
      .select('name images inStockQuantity reorderLevel status createdAt updatedAt')
      .lean();

    if (!product) {
      throw new InventoryItemNotFoundError(productId);
    }

    const stock = product.inStockQuantity || 0;
    const reorderLevel = product.reorderLevel || 10;

    return {
      id: product._id.toString(),
      name: product.name,
      images: product.images,
      currentStock: stock,
      reorderLevel,
      lowStock: stock <= reorderLevel,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async updateInventoryItem(sellerId: string, productId: string, updates: {
    stock?: number;
    reorderLevel?: number;
  }) {
    const product = await Product.findOne({ _id: productId, sellerId });
    if (!product) {
      throw new InventoryItemNotFoundError(productId);
    }

    if (updates.stock !== undefined && updates.stock >= 0) {
      product.inStockQuantity = updates.stock;
    }
    if (updates.reorderLevel !== undefined && updates.reorderLevel >= 0) {
      product.reorderLevel = updates.reorderLevel;
    }

    await product.save();

    return {
      productId: product._id.toString(),
      stock: product.inStockQuantity,
      reorderLevel: product.reorderLevel,
      updatedAt: product.updatedAt,
    };
  }

  async bulkUpdateInventory(sellerId: string, updates: Array<{
    productId: string;
    stock?: number;
    reorderLevel?: number;
  }>) {
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const update of updates) {
      const { productId, stock, reorderLevel } = update;

      const product = await Product.findOne({ _id: productId, sellerId });
      if (!product) {
        results.push({ productId, error: 'Product not found' });
        errorCount++;
        continue;
      }

      if (stock !== undefined && stock >= 0) {
        product.inStockQuantity = stock;
      }
      if (reorderLevel !== undefined && reorderLevel >= 0) {
        product.reorderLevel = reorderLevel;
      }

      await product.save();
      
      results.push({ 
        productId, 
        success: true,
        stock: product.inStockQuantity,
        reorderLevel: product.reorderLevel,
      });
      successCount++;
    }

    return {
      results,
      summary: {
        total: updates.length,
        successful: successCount,
        failed: errorCount,
      },
    };
  }

  async getInventoryExportData(sellerId: string, filters: {
    search?: string;
    status?: string;
    period?: string;
  } = {}) {
    const query = this.buildQuery(sellerId, filters);

    const products = await Product.find(query)
      .select('name sku inStockQuantity reorderLevel originalPrice finalPrice status createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();

    return products.map((product: any) => {
      const stock = product.inStockQuantity || 0;
      const reorderLevel = product.reorderLevel || 10;
      const stockStatus = stock === 0 ? 'Out of Stock' : 
                         stock <= reorderLevel ? 'Low Stock' : 'In Stock';
      
      return {
        productName: product.name || '',
        sku: product.sku || '',
        currentStock: stock,
        reorderLevel: reorderLevel,
        originalPrice: product.originalPrice || 0,
        finalPrice: product.finalPrice || 0,
        status: product.status || '',
        stockStatus,
        createdDate: new Date(product.createdAt).toLocaleDateString(),
        updatedDate: new Date(product.updatedAt).toLocaleDateString()
      };
    });
  }

  async getLowStockAlerts(sellerId: string) {
    const ObjectId = require('mongoose').Types.ObjectId;
    const sellerObjectId = new ObjectId(sellerId);

    const products = await Product.find({
      sellerId: sellerObjectId,
      $expr: {
        $lte: ['$inStockQuantity', { $ifNull: ['$reorderLevel', 10] }]
      }
    })
      .select('name mainImage inStockQuantity reorderLevel createdAt')
      .lean();

    return products.map((product: any) => ({
      id: product._id.toString(),
      productId: {
        id: product._id.toString(),
        name: product.name,
        mainImage: product.mainImage
      },
      currentStock: product.inStockQuantity || 0,
      reorderLevel: product.reorderLevel || 10,
      status: 'active' as const,
      createdAt: product.createdAt.toISOString()
    }));
  }
}

export const sellerInventoryRepository = new SellerInventoryRepository();