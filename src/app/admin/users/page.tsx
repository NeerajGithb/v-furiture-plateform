'use client';

import { 
  useAdminUsers, 
  useAdminUserStats, 
  useUpdateUserStatus,
  useAdminUser,
  useUserOrderHistory,
  useAddUserNote
} from "@/hooks/admin/useAdminUsers";
import { useConfirmUserStatus } from "@/hooks/useConfirmUserStatus";
import { useUserUIStore } from "@/stores/admin/userStore";
import { LoaderGuard } from "@/components/ui/LoaderGuard";
import { Pagination } from "@/components/ui/Pagination";
import { UsersStats } from "./components/UsersStats";
import { UsersList } from "./components/UsersList";
import { UserDetailsModal } from "./components/UserDetailsModal";

export default function AdminUsersPage() {
  const currentPage = useUserUIStore(s => s.currentPage);
  const selectedUserId = useUserUIStore(s => s.selectedUserId);
  const setCurrentPage = useUserUIStore(s => s.setCurrentPage);
  const setSelectedUserId = useUserUIStore(s => s.setSelectedUserId);
  const clearSelectedUser = useUserUIStore(s => s.clearSelectedUser);

  const { data: usersData, isLoading: usersLoading, error: usersError } = useAdminUsers({ page: currentPage });
  const { data: stats, isLoading: statsLoading, error: statsError } = useAdminUserStats();
  
  const { data: selectedUser, isLoading: userLoading } = useAdminUser(selectedUserId || '', !!selectedUserId);
  const { data: userOrders, isLoading: ordersLoading } = useUserOrderHistory(selectedUserId || '', !!selectedUserId);
  
  const updateUserStatus = useUpdateUserStatus();
  const addUserNote = useAddUserNote();
  
  const { confirmStatusChange } = useConfirmUserStatus({
    onConfirm: (userId, status) => updateUserStatus.mutate({ userId, status })
  });

  const users = usersData?.users || [];
  const pagination = usersData?.pagination;

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleCloseModal = () => {
    clearSelectedUser();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleUpdateStatus = (userId: string, status: string) => {
    confirmStatusChange(userId, status as "active" | "suspended");
  };

  const handleAddNote = (userId: string, note: string) => {
    addUserNote.mutate({ userId, note });
  };

  return (
    <LoaderGuard 
      isLoading={usersLoading || statsLoading} 
      error={usersError || statsError}
    >
      <UsersStats stats={stats} isLoading={statsLoading} />

      <UsersList
        users={users}
        onViewUser={handleViewUser}
        onUpdateStatus={handleUpdateStatus}
        isUpdating={updateUserStatus.isPending}
      />

      {pagination && (
        <Pagination
          pagination={pagination}
          onPageChange={handlePageChange}
          itemName="users"
          isLoading={usersLoading}
        />
      )}

      {selectedUserId && (
        <UserDetailsModal
          userId={selectedUserId}
          isOpen={!!selectedUserId}
          onClose={handleCloseModal}
          user={selectedUser}
          orders={userOrders}
          isUserLoading={userLoading}
          isOrdersLoading={ordersLoading}
          onAddNote={handleAddNote}
          isAddingNote={addUserNote.isPending}
        />
      )}
    </LoaderGuard>
  );
}