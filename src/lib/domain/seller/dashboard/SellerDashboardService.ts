import { sellerDashboardRepository } from "./SellerDashboardRepository";
import { SellerDashboardQueryRequest } from "./SellerDashboardSchemas";

export class SellerDashboardService {
  async getDashboardData(sellerId: string, query: SellerDashboardQueryRequest = {}) {
    const { period } = query;
    return await sellerDashboardRepository.getDashboardStats(sellerId, period);
  }
}

export const sellerDashboardService = new SellerDashboardService();