import SubCategory from "@/models/SubCategory";
import { SubcategoryNotFoundError, SubcategoryFetchError } from "./SellerSubcategoriesErrors";

interface PopulatedSubcategory {
  _id: any;
  name: string;
  slug: string;
  categoryId: {
    _id: any;
    name: string;
  };
}

export class SellerSubcategoriesRepository {
  async getAllSubcategories() {
    const subcategories = await SubCategory.find({})
      .select('_id name slug categoryId')
      .populate('categoryId', 'name')
      .sort({ name: 1 })
      .lean() as unknown as PopulatedSubcategory[];

    return subcategories.map(subcategory => ({
      id: subcategory._id.toString(),
      name: subcategory.name,
      slug: subcategory.slug,
      categoryId: subcategory.categoryId._id.toString(),
      categoryName: subcategory.categoryId.name,
    }));
  }

  async getSubcategoriesByCategory(categoryId: string) {
    const subcategories = await SubCategory.find({ categoryId })
      .select('_id name slug categoryId')
      .populate('categoryId', 'name')
      .sort({ name: 1 })
      .lean() as unknown as PopulatedSubcategory[];

    return subcategories.map(subcategory => ({
      id: subcategory._id.toString(),
      name: subcategory.name,
      slug: subcategory.slug,
      categoryId: subcategory.categoryId._id.toString(),
      categoryName: subcategory.categoryId.name,
    }));
  }

  async getSubcategoryById(subcategoryId: string) {
    const subcategory = await SubCategory.findById(subcategoryId)
      .select('_id name slug categoryId')
      .populate('categoryId', 'name')
      .lean() as PopulatedSubcategory | null;

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
  }
}

export const sellerSubcategoriesRepository = new SellerSubcategoriesRepository();