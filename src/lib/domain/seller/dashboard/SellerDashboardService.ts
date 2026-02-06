import { sellerDashboardRepository } from "./SellerDashboardRepository";
import { SellerDashboardQueryRequest } from "./SellerDashboardSchemas";

export class SellerDashboardService {
  async getDashboardData(sellerId: string, query: SellerDashboardQueryRequest = {}) {
    const { period = 'all', section } = query;

    // If specific section is requested, return only that section
    if (section) {
      switch (section) {
        case 'earnings':
          const earnings = await sellerDashboardRepository.getEarningsStats(sellerId);
          return { earnings };
        
        case 'orders':
          const orders = await sellerDashboardRepository.getOrderStats(sellerId);
          return { orders };
        
        case 'products':
          const products = await sellerDashboardRepository.getProductStats(sellerId);
          return { products };
        
        case 'reviews':
          const reviews = await sellerDashboardRepository.getReviewStats(sellerId);
          return { reviews };
        
        case 'overview':
        default:
          return await sellerDashboardRepository.getDashboardStats(sellerId, period);
      }
    }

    // Return complete dashboard data
    return await sellerDashboardRepository.getDashboardStats(sellerId, period);
  }

  async getEarningsStats(sellerId: string) {
    return await sellerDashboardRepository.getEarningsStats(sellerId);
  }

  async getOrderStats(sellerId: string) {
    return await sellerDashboardRepository.getOrderStats(sellerId);
  }

  async getProductStats(sellerId: string) {
    return await sellerDashboardRepository.getProductStats(sellerId);
  }

  async getReviewStats(sellerId: string) {
    return await sellerDashboardRepository.getReviewStats(sellerId);
  }
}

export const sellerDashboardService = new SellerDashboardService();