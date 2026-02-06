export interface SellerSubcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

export interface ISellerSubcategoriesRepository {
  // Subcategory queries
  getSubcategoriesByCategory(categoryId: string): Promise<SellerSubcategory[]>;
  getSubcategoryById(subcategoryId: string): Promise<SellerSubcategory>;
}