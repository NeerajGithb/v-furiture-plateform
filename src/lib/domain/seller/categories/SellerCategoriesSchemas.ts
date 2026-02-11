import { z } from "zod";
import { SortOrderSchema } from "../../shared/commonSchemas";

export const SellerCategoriesQuerySchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["name", "createdAt"]).default("name"),
  sortOrder: SortOrderSchema.default("asc"),
});

export type SellerCategoriesQueryRequest = z.infer<typeof SellerCategoriesQuerySchema>;