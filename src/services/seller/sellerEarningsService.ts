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
} from "@/types/sellerEarnings";

class SellerEarningsService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  // Get earnings data with summary
  async getEarningsData(params: EarningsQuery = {}): Promise<EarningsData> {
    const response = await this.get<EarningsData>("/seller/earnings", params);

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch earnings data.",
      );
    }
  }

  // Get earnings summary only
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

  // Get transactions with pagination and filters
  async getTransactions(params: EarningsFilters = {}): Promise<EarningsTransactionsResponse> {
    const response = await this.get<EarningsTransactionsResponse>("/seller/earnings", {
      action: "transactions",
      ...params
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch transactions.",
      );
    }
  }

  // Get payouts with pagination and filters
  async getPayouts(params: PayoutFilters = {}): Promise<EarningsPayoutsResponse> {
    const response = await this.get<EarningsPayoutsResponse>("/seller/earnings", {
      action: "payouts",
      ...params
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch payouts.",
      );
    }
  }

  // Get analytics data
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
      action: "cancel_payout",
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
      action: "bulk_transaction",
      ...data
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