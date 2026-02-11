import { adminDashboardRepository } from "./AdminDashboardRepository";
import { AdminDashboardQueryRequest, EntityScope } from "./AdminDashboardSchemas";
import { DashboardDataFetchError, InvalidPeriodError } from "./AdminDashboardErrors";

export class AdminDashboardService {
  async getDashboardStats(query: AdminDashboardQueryRequest) {
    const [
      overview,
      sales,
      users,
      products,
      sellers,
      orders,
      payments,
      reviews,
      realTime
    ] = await Promise.all([
      adminDashboardRepository.getDashboardOverview(query.overview),
      adminDashboardRepository.getSalesMetrics(query.sales),
      adminDashboardRepository.getUserMetrics(query.users),
      adminDashboardRepository.getProductMetrics(query.products),
      adminDashboardRepository.getSellerMetrics(query.sellers),
      adminDashboardRepository.getOrderMetrics(query.orders),
      adminDashboardRepository.getPaymentMetrics(query.payments),
      adminDashboardRepository.getReviewMetrics(query.reviews),
      query.refresh === 'true' ? adminDashboardRepository.getRealTimeMetrics() : null
    ]);

    return {
      overview,
      sales,
      users,
      products,
      sellers,
      orders,
      payments,
      reviews,
      ...(realTime && { realTime }),
      lastUpdated: new Date().toISOString()
    };
  }

  async getSalesMetrics(scope?: EntityScope) {
    return await adminDashboardRepository.getSalesMetrics(scope);
  }

  async getUserMetrics(scope?: EntityScope) {
    return await adminDashboardRepository.getUserMetrics(scope);
  }

  async getProductMetrics(scope?: EntityScope) {
    return await adminDashboardRepository.getProductMetrics(scope);
  }

  async getSellerMetrics(scope?: EntityScope) {
    return await adminDashboardRepository.getSellerMetrics(scope);
  }

  async getOrderMetrics(scope?: EntityScope) {
    return await adminDashboardRepository.getOrderMetrics(scope);
  }

  async getRealTimeMetrics() {
    return await adminDashboardRepository.getRealTimeMetrics();
  }

  async getPaymentMetrics(scope?: EntityScope) {
    return await adminDashboardRepository.getPaymentMetrics(scope);
  }

  async getReviewMetrics(scope?: EntityScope) {
    return await adminDashboardRepository.getReviewMetrics(scope);
  }

  async getOverviewMetrics(scope?: EntityScope) {
    return await adminDashboardRepository.getDashboardOverview(scope);
  }
}

export const adminDashboardService = new AdminDashboardService();