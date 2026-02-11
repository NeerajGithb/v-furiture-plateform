import { BasePrivateService } from "../baseService";
import type { AdminSeller, SellerStats, AdminSellersQueryRequest } from "@/types/admin/sellers";
import { PaginationResult } from "@/lib/domain/shared/types";

class AdminSellersService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  async getSellers(params: Partial<AdminSellersQueryRequest> = {}): Promise<PaginationResult<AdminSeller>> {
    return await this.getPaginated<AdminSeller>("/admin/sellers", params);
  }

  async getSellerStats(period?: string): Promise<SellerStats> {
    const response = await this.get<SellerStats>("/admin/sellers", { stats: "true", period });

    if (response.success) {
      return response.data as SellerStats;
    }
    
    throw new Error(response.error?.message || "Failed to fetch seller statistics");
  }

  async getSellerById(sellerId: string): Promise<AdminSeller> {
    const response = await this.get<AdminSeller>("/admin/sellers", { action: "seller-details", sellerId });

    if (response.success) {
      return response.data as AdminSeller;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch seller.",
      );
    }
  }

  async updateSellerStatus(sellerId: string, status: string, reason?: string): Promise<AdminSeller> {
    const response = await this.patch<AdminSeller>("/admin/sellers", {
      action: "update-status",
      sellerId,
      status,
      reason,
    });

    if (response.success) {
      return response.data as AdminSeller;
    } else {
      throw new Error(
        response.error?.message || "Failed to update seller status.",
      );
    }
  }

  async updateSellerVerification(sellerId: string, verified: boolean): Promise<AdminSeller> {
    const response = await this.patch<AdminSeller>("/admin/sellers", {
      action: "update-verification",
      sellerId,
      verified,
    });

    if (response.success) {
      return response.data as AdminSeller;
    } else {
      throw new Error(
        response.error?.message || "Failed to update seller verification.",
      );
    }
  }
}

export const adminSellersService = new AdminSellersService();
