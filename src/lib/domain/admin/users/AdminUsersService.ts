import { IAdminUsersRepository, UserDetails, UserStats, AdminUser } from "./IAdminUsersRepository";
import { AdminUsersRepository } from "./AdminUsersRepository";
import { AdminUsersQueryRequest, UserStatsQueryRequest } from "./AdminUsersSchemas";
import { UserNotFoundError, UserOperationError } from "./AdminUsersErrors";
import { PaginationResult } from "../../shared/types";

export class AdminUsersService {
  constructor(
    private repository: IAdminUsersRepository = new AdminUsersRepository(),
  ) {}

  async getUsers(query: AdminUsersQueryRequest): Promise<PaginationResult<AdminUser>> {
    return await this.repository.findMany(query);
  }

  async getUserStats(query: UserStatsQueryRequest): Promise<UserStats> {
    return await this.repository.getStats(query.period);
  }

  async getUserById(id: string): Promise<UserDetails> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new UserNotFoundError(id);
    }
    return user;
  }
}

export const adminUsersService = new AdminUsersService();