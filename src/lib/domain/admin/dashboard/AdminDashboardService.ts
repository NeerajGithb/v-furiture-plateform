import { adminDashboardRepository } from "./AdminDashboardRepository";
import { AdminDashboardQueryRequest, DashboardLayoutRequest } from "./AdminDashboardSchemas";
import { DashboardDataFetchError, InvalidPeriodError } from "./AdminDashboardErrors";

export class AdminDashboardService {
  async getDashboardStats(query: AdminDashboardQueryRequest) {
    // Validate period
    const validPeriods = ['1h', '24h', '7d', '30d', '90d', '1y', 'all'];
    if (!validPeriods.includes(query.period)) {
      throw new InvalidPeriodError(query.period);
    }

    try {
      // If specific section is requested, return only that section
      if (query.section) {
        switch (query.section) {
          case 'overview':
            return await adminDashboardRepository.getDashboardOverview(query);
          case 'sales':
            return await adminDashboardRepository.getSalesMetrics(query);
          case 'users':
            return await adminDashboardRepository.getUserMetrics(query);
          case 'products':
            return await adminDashboardRepository.getProductMetrics(query);
          case 'sellers':
            return await adminDashboardRepository.getSellerMetrics(query);
          case 'orders':
            return await adminDashboardRepository.getOrderMetrics(query);
          default:
            throw new DashboardDataFetchError(`Invalid section: ${query.section}`);
        }
      }

      // Return complete dashboard data
      const [
        overview,
        sales,
        users,
        products,
        sellers,
        orders,
        realTime
      ] = await Promise.all([
        adminDashboardRepository.getDashboardOverview(query),
        adminDashboardRepository.getSalesMetrics(query),
        adminDashboardRepository.getUserMetrics(query),
        adminDashboardRepository.getProductMetrics(query),
        adminDashboardRepository.getSellerMetrics(query),
        adminDashboardRepository.getOrderMetrics(query),
        query.refresh === 'true' ? adminDashboardRepository.getRealTimeMetrics() : null
      ]);

      return {
        overview,
        sales,
        users,
        products,
        sellers,
        orders,
        ...(realTime && { realTime }),
        period: query.period,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof DashboardDataFetchError || error instanceof InvalidPeriodError) {
        throw error;
      }
      throw new DashboardDataFetchError();
    }
  }

  async getSalesMetrics(query: AdminDashboardQueryRequest) {
    return await adminDashboardRepository.getSalesMetrics(query);
  }

  async getUserMetrics(query: AdminDashboardQueryRequest) {
    return await adminDashboardRepository.getUserMetrics(query);
  }

  async getProductMetrics(query: AdminDashboardQueryRequest) {
    return await adminDashboardRepository.getProductMetrics(query);
  }

  async getSellerMetrics(query: AdminDashboardQueryRequest) {
    return await adminDashboardRepository.getSellerMetrics(query);
  }

  async getOrderMetrics(query: AdminDashboardQueryRequest) {
    return await adminDashboardRepository.getOrderMetrics(query);
  }

  async getRealTimeMetrics() {
    return await adminDashboardRepository.getRealTimeMetrics();
  }

  async getWidget(widgetId: string) {
    return await adminDashboardRepository.getWidget(widgetId);
  }

  async updateWidget(widgetId: string, data: any) {
    return await adminDashboardRepository.updateWidget(widgetId, data);
  }

  async getDashboardLayout(adminId: string) {
    return await adminDashboardRepository.getDashboardLayout(adminId);
  }

  async updateDashboardLayout(adminId: string, layout: DashboardLayoutRequest) {
    return await adminDashboardRepository.updateDashboardLayout(adminId, layout);
  }

  async getOverviewMetrics(query: AdminDashboardQueryRequest) {
    return await adminDashboardRepository.getDashboardOverview(query);
  }

  // Utility method for getting quick stats
  async getQuickStats() {
    const query: AdminDashboardQueryRequest = { period: '24h', refresh: 'false' };
    const [overview, realTime] = await Promise.all([
      adminDashboardRepository.getDashboardOverview(query),
      adminDashboardRepository.getRealTimeMetrics()
    ]);

    return {
      todayRevenue: overview.totalRevenue,
      todayOrders: overview.totalOrders,
      activeUsers: realTime.activeUsers,
      systemHealth: realTime.systemHealth,
      lastUpdated: new Date().toISOString()
    };
  }

  // Method for exporting dashboard data
  async exportDashboardData(query: AdminDashboardQueryRequest, format: 'json' | 'csv' = 'json') {
    const dashboardData = await this.getDashboardStats(query);
    
    if (format === 'csv') {
      // Convert to CSV format (simplified)
      const csvData = this.convertToCSV(dashboardData);
      return {
        data: csvData,
        filename: `dashboard-export-${query.period}-${new Date().toISOString().split('T')[0]}.csv`,
        contentType: 'text/csv'
      };
    }

    return {
      data: dashboardData,
      filename: `dashboard-export-${query.period}-${new Date().toISOString().split('T')[0]}.json`,
      contentType: 'application/json'
    };
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion for overview data
    const overview = data.overview;
    const headers = Object.keys(overview).join(',');
    const values = Object.values(overview).join(',');
    return `${headers}\n${values}`;
  }
}

export const adminDashboardService = new AdminDashboardService();