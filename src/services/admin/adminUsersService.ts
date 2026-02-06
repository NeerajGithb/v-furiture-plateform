import { BasePrivateService } from "../baseService";
import { AdminUsersQuery } from "@/types/user";
import { AdminUser } from "@/lib/domain/admin/users/IAdminUsersRepository";

// Import AdminUserStats separately to avoid potential caching issues
import type { AdminUserStats } from "@/types/user";

interface UsersResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class AdminUsersService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  // Get admin users with pagination and filters
  async getUsers(params: AdminUsersQuery = {}): Promise<UsersResponse> {
    const response = await this.get<UsersResponse>("/admin/users", params);

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch users.",
      );
    }
  }

  // Get user statistics
  async getUserStats(): Promise<AdminUserStats> {
    const response = await this.get<AdminUserStats>("/admin/users", { action: "stats" });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch user statistics.",
      );
    }
  }

  // Get single user by ID
  async getUserById(userId: string): Promise<AdminUser> {
    const response = await this.get<AdminUser>("/admin/users", { 
      action: "user-details", 
      userId 
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch user.",
      );
    }
  }

  // Update user status
  async updateUserStatus(userId: string, status: string, reason?: string): Promise<AdminUser> {
    const response = await this.patch<AdminUser>("/admin/users", {
      action: "update-status",
      userId,
      status,
      reason
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to update user status.",
      );
    }
  }

  // Get user order history
  async getUserOrderHistory(userId: string, limit?: number): Promise<any[]> {
    const params: any = { action: "user-orders", userId };
    if (limit) params.limit = limit.toString();

    const response = await this.get<any[]>("/admin/users", params);

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch user orders.",
      );
    }
  }

  // Add user note
  async addUserNote(userId: string, note: string): Promise<AdminUser> {
    const response = await this.patch<AdminUser>("/admin/users", {
      action: "add-note",
      userId,
      note
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to add user note.",
      );
    }
  }
}

// Export singleton instance
export const adminUsersService = new AdminUsersService();