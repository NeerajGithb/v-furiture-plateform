export interface SellerCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ISellerCategoriesRepository {
  // Category queries
  getAllCategories(): Promise<SellerCategory[]>;
  getCategoryById(categoryId: string): Promise<SellerCategory>;
}