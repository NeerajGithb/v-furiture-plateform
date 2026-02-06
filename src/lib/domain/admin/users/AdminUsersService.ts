import { IAdminUsersRepository, AdminUser, UserStats } from "./IAdminUsersRepository";
import { AdminUsersRepository } from "./AdminUsersRepository";
import { 
  AdminUsersQueryRequest,
  UserStatusUpdateRequest
} from "./AdminUsersSchemas";
import {
  UserNotFoundError,
  UserValidationError,
  UserOperationError,
  UserStatusError,
} from "./AdminUsersErrors";
import { PaginationResult } from "../../shared/types";

export class AdminUsersService {
  constructor(
    private repository: IAdminUsersRepository = new AdminUsersRepository(),
  ) {}

  // Essential user queries
  async getUsers(query: AdminUsersQueryRequest): Promise<PaginationResult<AdminUser>> {
    try {
      return await this.repository.findMany(query);
    } catch (error) {
      throw new UserOperationError("getUsers", (error as Error).message);
    }
  }

  async getUserStats(period: string = "30d"): Promise<UserStats> {
    try {
      return await this.repository.getStats(period);
    } catch (error) {
      throw new UserOperationError("getUserStats", (error as Error).message);
    }
  }

  async getUserById(id: string): Promise<AdminUser> {
    try {
      const user = await this.repository.findById(id);
      if (!user) {
        throw new UserNotFoundError(id);
      }
      return user;
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw error;
      }
      throw new UserOperationError("getUserById", (error as Error).message);
    }
  }

  // Essential user management
  async updateUserStatus(request: UserStatusUpdateRequest): Promise<AdminUser> {
    try {
      const user = await this.repository.findById(request.userId);
      if (!user) {
        throw new UserNotFoundError(request.userId);
      }

      // Validate status transition
      this.validateStatusTransition(user.status, request.status);

      return await this.repository.updateStatus(
        request.userId, 
        request.status, 
        request.reason
      );
    } catch (error) {
      if (error instanceof UserNotFoundError || error instanceof UserStatusError) {
        throw error;
      }
      throw new UserOperationError("updateUserStatus", (error as Error).message);
    }
  }

  // Essential user activity
  async getUserOrderHistory(userId: string, limit?: number): Promise<any[]> {
    try {
      const user = await this.repository.findById(userId);
      if (!user) {
        throw new UserNotFoundError(userId);
      }

      return await this.repository.getOrderHistory(userId, limit);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw error;
      }
      throw new UserOperationError("getUserOrderHistory", (error as Error).message);
    }
  }

  async addUserNote(userId: string, note: string): Promise<AdminUser> {
    try {
      const user = await this.repository.findById(userId);
      if (!user) {
        throw new UserNotFoundError(userId);
      }

      if (!note.trim()) {
        throw new UserValidationError("note", "Note cannot be empty");
      }

      return await this.repository.addNote(userId, note.trim());
    } catch (error) {
      if (error instanceof UserNotFoundError || error instanceof UserValidationError) {
        throw error;
      }
      throw new UserOperationError("addUserNote", (error as Error).message);
    }
  }

  // Private validation methods
  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: Record<string, string[]> = {
      active: ["inactive", "suspended", "banned"],
      inactive: ["active", "suspended", "banned"],
      suspended: ["active", "inactive", "banned"],
      banned: [], // Cannot transition from banned without special process
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new UserStatusError(currentStatus, newStatus);
    }
  }
}

// Export singleton instance
export const adminUsersService = new AdminUsersService();