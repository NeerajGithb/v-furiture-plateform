import { BasePrivateService } from "../baseService";
import { AdminSeller, SellerStats } from "@/lib/domain/admin/sellers/IAdminSellersRepository";
import { PaginationResult } from "@/lib/domain/shared/types";

interface SellersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  verified?: boolean;
}

interface SellerStatusUpdate {
  status: "active" | "pending" | "suspended" | "inactive";
  reason?: string;
}

interface SellerVerificationUpdate {
  verified: boolean;
}

class AdminSellersService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  async getSellers(params: SellersQuery = {}): Promise<PaginationResult<AdminSeller>> {
    const response = await this.get<PaginationResult<AdminSeller>>("/admin/sellers", params);

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch sellers.",
      );
    }
  }

  async getSellerStats(): Promise<SellerStats> {
    const response = await this.get<SellerStats>("/admin/sellers", { action: "stats" });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch seller statistics.",
      );
    }
  }

  async getSellerById(sellerId: string): Promise<AdminSeller> {
    const response = await this.get<AdminSeller>("/admin/sellers", { action: "getById", sellerId });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch seller.",
      );
    }
  }

  async updateSellerStatus(sellerId: string, data: SellerStatusUpdate): Promise<AdminSeller> {
    const response = await this.patch<AdminSeller>("/admin/sellers", {
      action: "updateStatus",
      sellerId,
      ...data,
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to update seller status.",
      );
    }
  }

  async updateSellerVerification(sellerId: string, data: SellerVerificationUpdate): Promise<AdminSeller> {
    const response = await this.patch<AdminSeller>("/admin/sellers", {
      action: "updateVerification",
      sellerId,
      ...data,
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to update seller verification.",
      );
    }
  }
}

export const adminSellersService = new AdminSellersService();