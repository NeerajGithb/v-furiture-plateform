import { BasePrivateService } from "../baseService";
import { 
  AdminAnalyticsData,
  AdminAnalyticsQuery
} from "@/types/analytics";

class AdminAnalyticsService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  // Get analytics data
  async getAnalyticsData(params: AdminAnalyticsQuery = {}): Promise<AdminAnalyticsData> {
    const response = await this.get<AdminAnalyticsData>("/admin/analytics", params);

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch analytics data.",
      );
    }
  }

  // Export analytics data
  async exportAnalyticsData(options: any): Promise<any> {
    const response = await this.get("/admin/analytics", { action: "export", ...options });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to export analytics data.",
      );
    }
  }
}

// Export singleton instance
export const adminAnalyticsService = new AdminAnalyticsService();