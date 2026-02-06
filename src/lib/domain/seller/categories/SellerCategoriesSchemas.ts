import { z } from "zod";

export const SellerCategoriesQuerySchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["name", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type SellerCategoriesQueryRequest = z.infer<typeof SellerCategoriesQuerySchema>;