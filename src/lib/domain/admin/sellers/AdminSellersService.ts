import { IAdminSellersRepository, AdminSeller, SellerStats } from "./IAdminSellersRepository";
import { AdminSellersRepository } from "./AdminSellersRepository";
import { 
  AdminSellersQueryRequest,
  SellerStatusUpdateRequest,
  SellerVerificationUpdateRequest,
  SellerStatsQueryRequest
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
    return await this.repository.findMany(query);
  }

  async getSellerStats(query: SellerStatsQueryRequest): Promise<SellerStats> {
    return await this.repository.getStats(query.period);
  }

  async getSellerById(id: string): Promise<AdminSeller> {
    const seller = await this.repository.findById(id);
    if (!seller) {
      throw new SellerNotFoundError(id);
    }
    return seller;
  }

  async updateSellerStatus(request: SellerStatusUpdateRequest): Promise<AdminSeller> {
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
  }

  async updateSellerVerification(request: SellerVerificationUpdateRequest): Promise<AdminSeller> {
    const seller = await this.repository.findById(request.sellerId);
    if (!seller) {
      throw new SellerNotFoundError(request.sellerId);
    }

    return await this.repository.updateVerification(request.sellerId, request.verified);
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