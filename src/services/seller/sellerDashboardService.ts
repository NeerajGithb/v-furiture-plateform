import { BasePrivateService } from "../baseService";
import { SellerDashboardData } from "@/types/sellerDashboard";

interface DashboardQuery {
  period?: string;
}

class SellerDashboardService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  // Get seller dashboard data
  async getDashboardData(params: DashboardQuery = {}): Promise<SellerDashboardData> {
    const response = await this.get<SellerDashboardData>("/seller/dashboard", params);

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch dashboard data.",
      );
    }
  }
}

// Export singleton instance
export const sellerDashboardService = new SellerDashboardService();