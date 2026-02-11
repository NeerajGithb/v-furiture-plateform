import Category from "@/models/Category";
import { CategoryNotFoundError, CategoryFetchError } from "./SellerCategoriesErrors";

export class SellerCategoriesRepository {
  async getAllCategories() {
    const categories = await Category.find({})
      .select('_id name slug')
      .sort({ name: 1 })
      .lean();

    return categories.map((category: any) => ({
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
    }));
  }

  async getCategoryById(categoryId: string) {
    const category = await Category.findById(categoryId)
      .select('_id name slug')
      .lean();

    if (!category) {
      throw new CategoryNotFoundError(categoryId);
    }

    return {
      id: (category as any)._id.toString(),
      name: (category as any).name,
      slug: (category as any).slug,
    };
  }
}

export const sellerCategoriesRepository = new SellerCategoriesRepository();