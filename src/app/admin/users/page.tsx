'use client';

import { useAdminUsers, useAdminUserStats, useAdminUser } from "@/hooks/admin/useAdminUsers";
import { useUserUIStore } from "@/stores/admin/userStore";
import { LoaderGuard } from "@/components/ui/LoaderGuard";
import { Pagination } from "@/components/ui/Pagination";
import PageHeader from "@/components/PageHeader";
import { UsersStats } from "./components/UsersStats";
import { UsersList } from "./components/UsersList";
import { UserDetailsModal } from "./components/UserDetailsModal";

export default function AdminUsersPage() {
  const currentPage = useUserUIStore(s => s.currentPage);
  const selectedUserId = useUserUIStore(s => s.selectedUserId);
  const setCurrentPage = useUserUIStore(s => s.setCurrentPage);
  const setSelectedUserId = useUserUIStore(s => s.setSelectedUserId);
  const clearSelectedUser = useUserUIStore(s => s.clearSelectedUser);

  const { data: usersData, isPending, error, refetch, isFetching } = useAdminUsers();
  const { data: stats, isPending: statsPending } = useAdminUserStats();
  const { data: selectedUser, isPending: userLoading } = useAdminUser(selectedUserId!);

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleCloseModal = () => {
    clearSelectedUser();
  };

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage user accounts and activity"
        onRefresh={refetch}
        isRefreshing={isFetching}
      />

      <LoaderGuard 
        isLoading={isPending} 
        error={error}
        isEmpty={!usersData || (usersData.pagination?.total || 0) === 0}
        emptyMessage="No users"
      >
        {() => (
          <>
            <UsersStats stats={stats || { total: 0, active: 0, suspended: 0, verified: 0 }} />

            <UsersList
              users={usersData!.data}
              onViewUser={handleViewUser}
            />

            <Pagination
              pagination={usersData!.pagination}
              onPageChange={setCurrentPage}
            />

            {selectedUserId && (
              <UserDetailsModal
                userId={selectedUserId}
                isOpen={!!selectedUserId}
                onClose={handleCloseModal}
                user={selectedUser}
                isLoading={userLoading}
              />
            )}
          </>
        )}
      </LoaderGuard>
    </>
  );
}