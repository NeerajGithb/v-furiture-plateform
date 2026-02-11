import { BasePrivateService } from "../baseService";
import { 
  AdminAnalyticsQueryRequest,
  AdminAnalyticsData,
  AnalyticsExportRequest
} from "@/types/admin/analytics";

class AdminAnalyticsService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  async getAnalyticsData(params: Partial<AdminAnalyticsQueryRequest> = {}): Promise<AdminAnalyticsData> {
    const response = await this.get<AdminAnalyticsData>("/admin/analytics", params);

    if (response.success) {
      return response.data as AdminAnalyticsData;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch analytics data.",
      );
    }
  }

  async exportAnalyticsData(options: Partial<AnalyticsExportRequest>): Promise<Blob> {
    const response = await this.get("/admin/analytics", { action: "export", ...options });

    if (response.success) {
      return new Blob([JSON.stringify(response.data)], { type: 'application/json' });
    } else {
      throw new Error(
        response.error?.message || "Failed to export analytics data.",
      );
    }
  }
}

export const adminAnalyticsService = new AdminAnalyticsService();
