import { IAdminOrdersRepository, AdminOrder, OrderStats } from "./IAdminOrdersRepository";
import { AdminOrdersRepository } from "./AdminOrdersRepository";
import { 
  AdminOrdersQueryRequest,
  OrderStatsQueryRequest,
  OrderExportRequest
} from "./AdminOrdersSchemas";
import { PaginationResult } from "../../shared/types";

export class AdminOrdersService {
  constructor(
    private repository: IAdminOrdersRepository = new AdminOrdersRepository(),
  ) {}

  async getOrders(query: AdminOrdersQueryRequest): Promise<PaginationResult<AdminOrder>> {
    return await this.repository.findMany(query);
  }

  async getOrderStats(query: OrderStatsQueryRequest): Promise<OrderStats> {
    return await this.repository.getStats(query.period);
  }

  async exportOrders(request: OrderExportRequest): Promise<AdminOrder[]> {
    const query: AdminOrdersQueryRequest = {
      page: 1,
      limit: 10000,
      startDate: request.startDate,
      endDate: request.endDate,
      orderStatus: request.orderStatus,
      paymentStatus: request.paymentStatus,
      sortBy: "createdAt",
      sortOrder: "desc",
    };

    return await this.repository.exportOrders(query);
  }
}

// Export singleton instance
export const adminOrdersService = new AdminOrdersService();