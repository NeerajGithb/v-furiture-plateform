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
    const [overview, topPerformers, userAnalytics, salesAnalytics, realTimeStats] = await Promise.all([
      this.getAnalyticsOverview(query),
      this.getTopPerformers(query),
      this.getUserAnalytics(query),
      this.getSalesAnalytics(query),
      this.getRealTimeStats()
    ]);

    return {
      overview,
      topPerformers,
      userAnalytics,
      salesAnalytics,
      realTimeStats
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