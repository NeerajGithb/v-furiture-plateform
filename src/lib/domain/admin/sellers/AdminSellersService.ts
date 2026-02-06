import { IAdminSellersRepository, AdminSeller, SellerStats } from "./IAdminSellersRepository";
import { AdminSellersRepository } from "./AdminSellersRepository";
import { 
  AdminSellersQueryRequest,
  SellerStatusUpdateRequest,
  SellerVerificationUpdateRequest
} from "./AdminSellersSchemas";
import {
  SellerNotFoundError,
  SellerValidationError,
  SellerOperationError,
  SellerStatusError,
} from "./AdminSellersErrors";
import { PaginationResult } from "../../shared/types";

export class AdminSellersService {
  constructor(
    private repository: IAdminSellersRepository = new AdminSellersRepository(),
  ) {}

  async getSellers(query: AdminSellersQueryRequest): Promise<PaginationResult<AdminSeller>> {
    try {
      return await this.repository.findMany(query);
    } catch (error) {
      throw new SellerOperationError("getSellers", (error as Error).message);
    }
  }

  async getSellerStats(period: string = "30d"): Promise<SellerStats> {
    try {
      return await this.repository.getStats(period);
    } catch (error) {
      throw new SellerOperationError("getSellerStats", (error as Error).message);
    }
  }

  async getSellerById(id: string): Promise<AdminSeller> {
    try {
      const seller = await this.repository.findById(id);
      if (!seller) {
        throw new SellerNotFoundError(id);
      }
      return seller;
    } catch (error) {
      if (error instanceof SellerNotFoundError) {
        throw error;
      }
      throw new SellerOperationError("getSellerById", (error as Error).message);
    }
  }

  async updateSellerStatus(request: SellerStatusUpdateRequest): Promise<AdminSeller> {
    try {
      const seller = await this.repository.findById(request.sellerId);
      if (!seller) {
        throw new SellerNotFoundError(request.sellerId);
      }

      this.validateStatusTransition(seller.status, request.status);

      return await this.repository.updateStatus(
        request.sellerId, 
        request.status, 
        request.reason
      );
    } catch (error) {
      if (error instanceof SellerNotFoundError || error instanceof SellerStatusError) {
        throw error;
      }
      throw new SellerOperationError("updateSellerStatus", (error as Error).message);
    }
  }

  async updateSellerVerification(request: SellerVerificationUpdateRequest): Promise<AdminSeller> {
    try {
      const seller = await this.repository.findById(request.sellerId);
      if (!seller) {
        throw new SellerNotFoundError(request.sellerId);
      }

      return await this.repository.updateVerification(request.sellerId, request.verified);
    } catch (error) {
      if (error instanceof SellerNotFoundError) {
        throw error;
      }
      throw new SellerOperationError("updateSellerVerification", (error as Error).message);
    }
  }

  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: Record<string, string[]> = {
      pending: ["active", "suspended"],
      active: ["suspended", "inactive"],
      suspended: ["active", "inactive"],
      inactive: ["active", "suspended"],
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new SellerStatusError(currentStatus, newStatus);
    }
  }
}

export const adminSellersService = new AdminSellersService();