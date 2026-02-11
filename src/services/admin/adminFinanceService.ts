import { BasePrivateService } from "../baseService";
import { FinanceData } from '@/types/admin/finance';

class AdminFinanceService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  async getFinanceData(period?: string): Promise<FinanceData> {
    const response = await this.get<FinanceData>("/admin/finance", {
      ...(period && { period }),
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch finance data.",
      );
    }
  }

  async exportFinanceReport(params: {
    period?: string;
    format?: 'csv' | 'xlsx' | 'pdf';
  }): Promise<Blob> {
    const response = await this.get("/admin/finance", {
      type: "export",
      ...params,
    });

    if (response.success) {
      return new Blob([JSON.stringify(response.data)], { type: 'application/json' });
    } else {
      throw new Error(
        response.error?.message || "Failed to export finance report.",
      );
    }
  }
}

export const adminFinanceService = new AdminFinanceService();