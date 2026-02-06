import { adminAnalyticsRepository } from "./AdminAnalyticsRepository";
import { AdminAnalyticsQueryRequest, AnalyticsExportRequest } from "./AdminAnalyticsSchemas";

export class AdminAnalyticsService {
  async getAnalyticsOverview(query: AdminAnalyticsQueryRequest) {
    return await adminAnalyticsRepository.getAnalyticsOverview(query);
  }

  async getAnalyticsMetrics(query: AdminAnalyticsQueryRequest) {
    return await adminAnalyticsRepository.getAnalyticsMetrics(query);
  }

  async getTopPerformers(query: AdminAnalyticsQueryRequest) {
    return await adminAnalyticsRepository.getTopPerformers(query);
  }

  async getUserAnalytics(query: AdminAnalyticsQueryRequest) {
    return await adminAnalyticsRepository.getUserAnalytics(query);
  }

  async getSalesAnalytics(query: AdminAnalyticsQueryRequest) {
    return await adminAnalyticsRepository.getSalesAnalytics(query);
  }

  async getCompleteAnalytics(query: AdminAnalyticsQueryRequest) {
    const [overview, metrics, topPerformers, userAnalytics, salesAnalytics] = await Promise.all([
      this.getAnalyticsOverview(query),
      this.getAnalyticsMetrics(query),
      this.getTopPerformers(query),
      this.getUserAnalytics(query),
      this.getSalesAnalytics(query)
    ]);

    return {
      overview,
      metrics,
      topPerformers,
      userAnalytics,
      salesAnalytics
    };
  }

  async exportAnalytics(query: AnalyticsExportRequest) {
    return await adminAnalyticsRepository.exportAnalytics(query);
  }

  async getRealTimeStats() {
    return await adminAnalyticsRepository.getRealTimeStats();
  }
}

export const adminAnalyticsService = new AdminAnalyticsService();