import { NextRequest } from "next/server";
import { withSellerAuth } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { sellerInventoryService } from "@/lib/domain/seller/inventory/SellerInventoryService";
import { StockUpdateSchema } from "@/lib/domain/seller/inventory/SellerInventorySchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { AuthenticatedSeller } from "@/lib/middleware/auth";

export const GET = withSellerAuth(
  withDB(
    withRouteErrorHandling(async (
      request: NextRequest, 
      seller: AuthenticatedSeller,
      { params }: { params: Promise<{ productId: string }> }
    ) => {
      const { productId } = await params;
      
      const result = await sellerInventoryService.getInventoryItem(seller.id, productId);
      return ApiResponseBuilder.success({ item: result });
    })
  )
);

export const PUT = withSellerAuth(
  withDB(
    withRouteErrorHandling(async (
      request: NextRequest, 
      seller: AuthenticatedSeller,
      { params }: { params: Promise<{ productId: string }> }
    ) => {
      const { productId } = await params;
      const body = await request.json();
      
      const validatedData = StockUpdateSchema.parse(body);
      const result = await sellerInventoryService.updateInventoryItem(seller.id, productId, validatedData);
      
      return ApiResponseBuilder.success(result, { message: "Inventory updated successfully" });
    })
  )
);