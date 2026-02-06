import { BasePrivateService } from "../baseService";
import { FinanceData, FinanceTransaction, FinancialSummary, FinancialStats, FinancialBreakdown } from '@/types/finance';
import { TimePeriod } from '@/types/common';

interface FinanceResponse {
  summary: FinancialSummary;
  stats: FinancialStats;
  breakdown: FinancialBreakdown;
  transactions: FinanceTransaction[];
}

interface TransactionsResponse {
  transactions: FinanceTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class AdminFinanceService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  // Get finance overview data
  async getFinanceData(period: TimePeriod = '30days'): Promise<FinanceResponse> {
    const response = await this.get<FinanceResponse>("/admin/finance", {
      action: "overview",
      period,
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch finance data.",
      );
    }
  }

  // Get transactions with pagination
  async getTransactions(params: {
    period?: TimePeriod;
    page?: number;
    limit?: number;
    paymentStatus?: string;
    orderStatus?: string;
    paymentMethod?: string;
    minAmount?: number;
    maxAmount?: number;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<TransactionsResponse> {
    const response = await this.get<TransactionsResponse>("/admin/finance", {
      action: "transactions",
      ...params,
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch transactions.",
      );
    }
  }

  // Get financial summary
  async getFinancialSummary(period: TimePeriod = '30days'): Promise<FinancialSummary> {
    const response = await this.get<{ summary: FinancialSummary }>("/admin/finance", {
      action: "summary",
      period,
    });

    if (response.success) {
      return response.data!.summary;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch financial summary.",
      );
    }
  }

  // Get financial stats
  async getFinancialStats(period: TimePeriod = '30days'): Promise<FinancialStats> {
    const response = await this.get<{ stats: FinancialStats }>("/admin/finance", {
      action: "stats",
      period,
    });

    if (response.success) {
      return response.data!.stats;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch financial stats.",
      );
    }
  }

  // Get financial breakdown
  async getFinancialBreakdown(period: TimePeriod = '30days'): Promise<FinancialBreakdown> {
    const response = await this.get<{ breakdown: FinancialBreakdown }>("/admin/finance", {
      action: "breakdown",
      period,
    });

    if (response.success) {
      return response.data!.breakdown;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch financial breakdown.",
      );
    }
  }

  // Export finance report
  async exportFinanceReport(params: {
    period: TimePeriod;
    format?: 'csv' | 'xlsx' | 'pdf';
    paymentStatus?: string;
    orderStatus?: string;
    paymentMethod?: string;
    minAmount?: number;
    maxAmount?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const response = await this.get("/admin/finance", {
      action: "export",
      format: 'csv',
      ...params,
    });

    if (response.success) {
      // Return blob for download
      return new Blob([JSON.stringify(response.data)], { type: 'application/json' });
    } else {
      throw new Error(
        response.error?.message || "Failed to export finance report.",
      );
    }
  }

  // Update transaction status (for admin actions)
  async updateTransactionStatus(transactionId: string, status: string, notes?: string): Promise<FinanceTransaction> {
    const response = await this.patch<{ transaction: FinanceTransaction }>(`/admin/finance/${transactionId}`, {
      status,
      notes,
    });

    if (response.success) {
      return response.data!.transaction;
    } else {
      throw new Error(
        response.error?.message || "Failed to update transaction status.",
      );
    }
  }

  // Process payout
  async processPayout(transactionId: string, data: {
    amount: number;
    notes?: string;
    processedBy: string;
  }): Promise<FinanceTransaction> {
    const response = await this.post<{ transaction: FinanceTransaction }>("/admin/finance", {
      action: "process-payout",
      transactionId,
      ...data,
    });

    if (response.success) {
      return response.data!.transaction;
    } else {
      throw new Error(
        response.error?.message || "Failed to process payout.",
      );
    }
  }

  // Bulk process payouts
  async bulkProcessPayouts(transactionIds: string[], data: {
    notes?: string;
    processedBy: string;
  }): Promise<{ processedCount: number }> {
    const response = await this.post<{ processedCount: number }>("/admin/finance", {
      action: "bulk-payout",
      transactionIds,
      ...data,
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to process bulk payouts.",
      );
    }
  }
}

// Export singleton instance
export const adminFinanceService = new AdminFinanceService();