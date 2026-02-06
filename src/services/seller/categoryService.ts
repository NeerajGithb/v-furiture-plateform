import { BasePrivateService } from "../baseService";

interface Category {
  _id: string;
  name: string;
  slug: string;
  mainImage?: {
    url: string;
    alt?: string;
  };
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SubCategory {
  _id: string;
  name: string;
  slug: string;
  categoryId: string | Category;
  mainImage?: {
    url: string;
    alt?: string;
  };
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class CategoryService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  /**
   * Fetches all categories for seller
   */
  async getCategories(): Promise<Category[]> {
    const response = await this.get<Category[]>("/categories");
    return response.data || [];
  }

  /**
   * Fetches all subcategories for seller
   */
  async getSubcategories(): Promise<SubCategory[]> {
    const response = await this.get<SubCategory[]>("/subcategories");
    return response.data || [];
  }

  /**
   * Gets subcategories by category ID
   */
  async getSubcategoriesByCategory(categoryId: string): Promise<SubCategory[]> {
    const subcategories = await this.getSubcategories();
    return subcategories.filter((sub) => 
      typeof sub.categoryId === 'string' 
        ? sub.categoryId === categoryId 
        : sub.categoryId._id === categoryId
    );
  }
}

// Export singleton instance
export const categoryService = new CategoryService();