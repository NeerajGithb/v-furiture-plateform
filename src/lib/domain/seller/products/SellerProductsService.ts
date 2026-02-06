import { SellerProductsRepository, ProductFilters, CreateProductData, UpdateProductData, BulkUpdateData, sellerProductsRepository } from "./SellerProductsRepository";
import { 
  SellerAccountInactiveError,
  ProductExportError
} from "./SellerProductsErrors";

export class SellerProductsService {
  constructor(private repository: SellerProductsRepository) {}

  async getProducts(filters: ProductFilters) {
    const result = await this.repository.findProducts(filters);
    
    // Calculate stats for the current filter
    const stats = {
      total: result.products.length,
      published: result.products.filter((p: any) => p.isPublished).length,
      draft: result.products.filter((p: any) => !p.isPublished).length,
      outOfStock: result.products.filter((p: any) => (p.inStockQuantity || 0) === 0).length,
      lowStock: result.products.filter((p: any) => (p.inStockQuantity || 0) > 0 && (p.inStockQuantity || 0) <= 10).length,
    };

    // Format products to match frontend expectations
    const formattedProducts = result.products.map((product: any) => ({
      _id: product._id.toString(),
      name: product.name,
      description: product.description,
      categoryId: product.categoryId?.name || 'Uncategorized',
      subCategoryId: product.subCategoryId?.name || '',
      itemId: product.itemId,
      sku: product.sku,
      originalPrice: product.originalPrice,
      finalPrice: product.finalPrice,
      discountPercent: product.discountPercent || 0,
      inStockQuantity: product.inStockQuantity || 0,
      mainImage: product.mainImage,
      galleryImages: product.galleryImages || [],
      isPublished: product.isPublished || false,
      status: product.status,
      rejectionReason: product.rejectionReason,
      totalSold: product.totalSold || 0,
      viewCount: product.viewCount || 0,
      wishlistCount: product.wishlistCount || 0,
      totalCart: product.totalCart || 0,
      ratings: product.ratings || 0,
      reviews: product.reviews,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    return {
      products: formattedProducts,
      stats,
      pagination: result.pagination
    };
  }

  async getProductStats(sellerId: string) {
    return await this.repository.getProductStats(sellerId);
  }

  async getProductById(productId: string, sellerId: string) {
    return await this.repository.findById(productId, sellerId);
  }

  async createProduct(sellerId: string, sellerStatus: string, data: CreateProductData) {
    // Check if seller account is active
    if (sellerStatus !== 'active') {
      throw new SellerAccountInactiveError();
    }

    const product = await this.repository.create(sellerId, data);

    return {
      id: product._id.toString(),
      itemId: product.itemId,
      sku: product.sku,
      slug: product.slug,
    };
  }

  async updateProduct(productId: string, sellerId: string, data: UpdateProductData) {
    return await this.repository.update(productId, sellerId, data);
  }

  async deleteProduct(productId: string, sellerId: string) {
    return await this.repository.delete(productId, sellerId);
  }

  async bulkUpdateProducts(sellerId: string, data: BulkUpdateData) {
    return await this.repository.bulkUpdate(sellerId, data);
  }

  async exportProducts(sellerId: string, format: 'csv' | 'json' = 'csv', search?: string, status?: string) {
    try {
      const products = await this.repository.getProductsForExport(sellerId, search, status);

      if (format === 'csv') {
        // Convert to CSV
        const headers = [
          'Name',
          'Description',
          'Original Price',
          'Final Price',
          'Stock Quantity',
          'Status',
          'Published',
          'Created At',
          'Updated At'
        ];

        const csvRows = [
          headers.join(','),
          ...products.map(product => [
            `"${product.name || ''}"`,
            `"${product.description || ''}"`,
            product.originalPrice || 0,
            product.finalPrice || 0,
            product.inStockQuantity || 0,
            product.status || '',
            product.isPublished ? 'Yes' : 'No',
            new Date(product.createdAt).toLocaleDateString(),
            new Date(product.updatedAt).toLocaleDateString()
          ].join(','))
        ];

        return {
          content: csvRows.join('\n'),
          filename: `products-export-${new Date().toISOString().split('T')[0]}.csv`,
          contentType: 'text/csv'
        };
      } else {
        // Return JSON
        return {
          content: JSON.stringify(products, null, 2),
          filename: `products-export-${new Date().toISOString().split('T')[0]}.json`,
          contentType: 'application/json'
        };
      }
    } catch (error) {
      throw new ProductExportError(`Failed to export products: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateProductStatus(productId: string, sellerId: string, isPublished: boolean) {
    return await this.repository.updateProductStatus(productId, sellerId, isPublished);
  }
}

// Create and export service instance
export const sellerProductsService = new SellerProductsService(sellerProductsRepository);