import { BasePrivateService } from "../baseService";

export interface Category {
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

export interface SubCategory {
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
    super("/api/seller");
  }

  async getCategories(): Promise<Category[]> {
    try {
      const response = await this.get<{ categories: Category[] }>("/categories");
      if (response.success && response.data) {
        return response.data.categories || [];
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      throw error;
    }
  }

  async getSubcategories(): Promise<SubCategory[]> {
    try {
      const response = await this.get<{ subcategories: SubCategory[] }>("/subcategories");
      if (response.success && response.data) {
        return response.data.subcategories || [];
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch subcategories:", error);
      throw error;
    }
  }

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