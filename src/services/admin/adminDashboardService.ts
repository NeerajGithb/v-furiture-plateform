import { BasePrivateService } from "../baseService";
import type { AdminDashboardStats } from "@/types/admin/dashboard";

class AdminDashboardService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  async getDashboardData(params: { period?: string } = {}): Promise<AdminDashboardStats> {
    const response = await this.get<AdminDashboardStats>("/admin/dashboard", params);

    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch dashboard data.",
      );
    }
  }
}

export default new AdminDashboardService();
