import { sellerSubcategoriesRepository } from "./SellerSubcategoriesRepository";
import { SellerSubcategoriesQueryRequest } from "./SellerSubcategoriesSchemas";

export class SellerSubcategoriesService {
  async getSubcategories(query: SellerSubcategoriesQueryRequest = {
    sortBy: 'name',
    sortOrder: 'asc'
  }) {
    let subcategories;
    
    if (query.categoryId) {
      subcategories = await sellerSubcategoriesRepository.getSubcategoriesByCategory(query.categoryId);
    } else {
      subcategories = await sellerSubcategoriesRepository.getAllSubcategories();
    }

    // Apply search filter if provided
    let filteredSubcategories = subcategories;
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filteredSubcategories = subcategories.filter(subcategory =>
        subcategory.name.toLowerCase().includes(searchLower) ||
        subcategory.slug.toLowerCase().includes(searchLower) ||
        subcategory.categoryName.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filteredSubcategories.sort((a, b) => {
      const aValue = a.name;
      const bValue = b.name;
      
      if (query.sortOrder === "desc") {
        return bValue.localeCompare(aValue);
      }
      return aValue.localeCompare(bValue);
    });

    return {
      subcategories: filteredSubcategories,
      total: filteredSubcategories.length,
    };
  }

  async getSubcategoryById(subcategoryId: string) {
    return await sellerSubcategoriesRepository.getSubcategoryById(subcategoryId);
  }
}

export const sellerSubcategoriesService = new SellerSubcategoriesService();