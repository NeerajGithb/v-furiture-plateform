import { BasePrivateService } from "../baseService";
import type { AdminUsersQueryRequest, UserDetails, UserStats } from "@/types/admin/users";
import type { AdminUser } from "@/lib/domain/admin/users/IAdminUsersRepository";
import { PaginationResult } from "@/lib/domain/shared/types";

class AdminUsersService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  async getUsers(params: Partial<AdminUsersQueryRequest> = {}): Promise<PaginationResult<AdminUser>> {
    return await this.getPaginated<AdminUser>("/admin/users", params);
  }

  async getUserStats(period?: string): Promise<UserStats> {
    const params: any = { stats: "true" };
    if (period) params.period = period;
    
    const response = await this.get<UserStats>("/admin/users", params);

    if (response.success) {
      return response.data as UserStats;
    }
    
    throw new Error(response.error?.message || "Failed to fetch user stats");
  }

  async getUserById(userId: string): Promise<UserDetails> {
    const response = await this.get("/admin/users", { userId });

    if (response.success) {
      return response.data as UserDetails;
    }
    
    throw new Error(response.error?.message || "Failed to fetch user");
  }
}

export const adminUsersService = new AdminUsersService();
