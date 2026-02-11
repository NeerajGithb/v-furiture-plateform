import { sellerCategoriesRepository } from "./SellerCategoriesRepository";
import { SellerCategoriesQueryRequest } from "./SellerCategoriesSchemas";

export class SellerCategoriesService {
  async getCategories(query: Partial<SellerCategoriesQueryRequest> = {}) {
    const categories = await sellerCategoriesRepository.getAllCategories();

    // Apply search filter if provided
    let filteredCategories = categories;
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchLower) ||
        category.slug.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filteredCategories.sort((a, b) => {
      const aValue = a.name;
      const bValue = b.name;
      
      if (query.sortOrder === "desc") {
        return bValue.localeCompare(aValue);
      }
      return aValue.localeCompare(bValue);
    });

    return {
      categories: filteredCategories,
      total: filteredCategories.length,
    };
  }

  async getCategoryById(categoryId: string) {
    return await sellerCategoriesRepository.getCategoryById(categoryId);
  }
}

export const sellerCategoriesService = new SellerCategoriesService();