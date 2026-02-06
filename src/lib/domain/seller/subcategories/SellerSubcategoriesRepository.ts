import SubCategory from "@/models/SubCategory";
import { SubcategoryNotFoundError, SubcategoryFetchError } from "./SellerSubcategoriesErrors";

export class SellerSubcategoriesRepository {
  async getAllSubcategories() {
    try {
      const subcategories = await SubCategory.find({})
        .select('_id name slug categoryId')
        .populate('categoryId', 'name')
        .sort({ name: 1 })
        .lean();

      return subcategories.map(subcategory => ({
        id: subcategory._id.toString(),
        name: subcategory.name,
        slug: subcategory.slug,
        categoryId: subcategory.categoryId._id.toString(),
        categoryName: subcategory.categoryId.name,
      }));
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      throw new SubcategoryFetchError("Failed to fetch subcategories");
    }
  }

  async getSubcategoriesByCategory(categoryId: string) {
    try {
      const subcategories = await SubCategory.find({ categoryId })
        .select('_id name slug categoryId')
        .populate('categoryId', 'name')
        .sort({ name: 1 })
        .lean();

      return subcategories.map(subcategory => ({
        id: subcategory._id.toString(),
        name: subcategory.name,
        slug: subcategory.slug,
        categoryId: subcategory.categoryId._id.toString(),
        categoryName: subcategory.categoryId.name,
      }));
    } catch (error) {
      console.error("Error fetching subcategories by category:", error);
      throw new SubcategoryFetchError("Failed to fetch subcategories");
    }
  }

  async getSubcategoryById(subcategoryId: string) {
    try {
      const subcategory = await SubCategory.findById(subcategoryId)
        .select('_id name slug categoryId')
        .populate('categoryId', 'name')
        .lean();

      if (!subcategory) {
        throw new SubcategoryNotFoundError(subcategoryId);
      }

      return {
        id: subcategory._id.toString(),
        name: subcategory.name,
        slug: subcategory.slug,
        categoryId: subcategory.categoryId._id.toString(),
        categoryName: subcategory.categoryId.name,
      };
    } catch (error) {
      if (error instanceof SubcategoryNotFoundError) {
        throw error;
      }
      console.error("Error fetching subcategory:", error);
      throw new SubcategoryFetchError("Failed to fetch subcategory");
    }
  }
}

export const sellerSubcategoriesRepository = new SellerSubcategoriesRepository();