import { z } from "zod";

export const SellerSubcategoriesQuerySchema = z.object({
  categoryId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["name", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type SellerSubcategoriesQueryRequest = z.infer<typeof SellerSubcategoriesQuerySchema>;