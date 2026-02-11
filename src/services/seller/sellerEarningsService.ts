import { BasePrivateService } from "../baseService";
import { 
  EarningsData,
  EarningsQuery,
  PayoutRequest,
  EarningsTransactionsResponse,
  EarningsPayoutsResponse,
  EarningsFilters,
  PayoutFilters,
  EarningsExportData,
  BulkTransactionAction
} from "@/types/seller/earnings";

class SellerEarningsService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  // Get earnings data with summary
  async getEarningsData(params: any = {}): Promise<any> {
    const response = await this.get<any>("/seller/earnings", params);

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch earnings data.",
      );
    }
  }

  async getEarningsSummary(period?: string): Promise<any> {
    const params = period ? { action: "summary", period } : { action: "summary" };
    const response = await this.get<{ summary: any }>("/seller/earnings", params);

    if (response.success) {
      return response.data!.summary;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch earnings summary.",
      );
    }
  }

  async getTransactions(params: any = {}): Promise<any> {
    const result = await this.getPaginated<any>("/seller/earnings", {
      action: "transactions",
      ...params
    });

    return {
      transactions: result.data || [],
      pagination: result.pagination
    };
  }

  async getPayouts(params: any = {}): Promise<any> {
    const result = await this.getPaginated<any>("/seller/earnings", {
      action: "payouts",
      ...params
    });

    return {
      payouts: result.data || [],
      pagination: result.pagination
    };
  }

  async getAnalytics(period?: string): Promise<any> {
    const params = period ? { action: "analytics", period } : { action: "analytics" };
    const response = await this.get<{ analytics: any }>("/seller/earnings", params);

    if (response.success) {
      return response.data!.analytics;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch analytics.",
      );
    }
  }

  // Request payout
  async requestPayout(data: PayoutRequest): Promise<any> {
    const response = await this.post("/seller/earnings", {
      action: "payout",
      ...data,
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to request payout.",
      );
    }
  }

  // Cancel payout
  async cancelPayout(payoutId: string): Promise<any> {
    const response = await this.patch(`/seller/earnings`, {
      payoutId
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to cancel payout.",
      );
    }
  }

  // Export earnings data
  async exportEarnings(options: EarningsExportData): Promise<any> {
    const response = await this.get("/seller/earnings", { 
      action: "export", 
      ...options 
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to export earnings.",
      );
    }
  }

  // Bulk transaction actions
  async bulkTransactionAction(data: BulkTransactionAction): Promise<any> {
    const response = await this.post("/seller/earnings", {
      ...data,
      action: "bulk_transaction"
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to perform bulk action.",
      );
    }
  }

  // Get transaction details
  async getTransactionById(transactionId: string): Promise<any> {
    const response = await this.get(`/seller/earnings/${transactionId}`);

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch transaction details.",
      );
    }
  }

  // Get payout details
  async getPayoutById(payoutId: string): Promise<any> {
    const response = await this.get(`/seller/earnings/payouts/${payoutId}`);

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch payout details.",
      );
    }
  }
}

// Export singleton instance
export const sellerEarningsService = new SellerEarningsService();