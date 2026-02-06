import { adminFinanceRepository } from "./AdminFinanceRepository";
import { FinanceQueryRequest, PayoutQueryRequest, PayoutCreateRequest, PayoutUpdateRequest } from "./AdminFinanceSchemas";

export class AdminFinanceService {
  async getFinanceOverview(query: FinanceQueryRequest) {
    return await adminFinanceRepository.getFinanceOverview(query);
  }

  async getRevenueData(query: FinanceQueryRequest) {
    return await adminFinanceRepository.getRevenueData(query);
  }

  async getPayouts(query: PayoutQueryRequest) {
    return await adminFinanceRepository.getPayouts(query);
  }

  async getPayoutById(id: string) {
    const payout = await adminFinanceRepository.getPayoutById(id);
    if (!payout) {
      throw new Error(`Payout with ID ${id} not found`);
    }
    return payout;
  }

  async getPayoutStats() {
    return await adminFinanceRepository.getPayoutStats();
  }

  async createPayout(data: PayoutCreateRequest) {
    return await adminFinanceRepository.createPayout(data);
  }

  async updatePayout(id: string, data: PayoutUpdateRequest) {
    return await adminFinanceRepository.updatePayout(id, data);
  }

  async approvePayout(id: string) {
    return await adminFinanceRepository.approvePayout(id);
  }

  async rejectPayout(id: string, reason: string) {
    return await adminFinanceRepository.rejectPayout(id, reason);
  }

  async getTopSellersByRevenue(limit: number = 10) {
    return await adminFinanceRepository.getTopSellersByRevenue(limit);
  }

  async getRevenueByCategory() {
    return await adminFinanceRepository.getRevenueByCategory();
  }
}

export const adminFinanceService = new AdminFinanceService();