import React from 'react';
import type { AdminUser } from '@/types/admin/users';
import { formatDate } from '@/utils/formatDate';
import { 
  Mail, 
  MailCheck, 
  Eye
} from 'lucide-react';

interface UsersListProps {
  users: AdminUser[];
  onViewUser: (userId: string) => void;
}

export const UsersList: React.FC<UsersListProps> = ({
  users,
  onViewUser
}) => {
  const getStatusBadge = (user: AdminUser) => {
    if (user.status === 'suspended') {
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Suspended</span>;
    }
    if (user.emailVerified) {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Verified</span>;
    }
    return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {user.name?.[0] || user.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                        {user.emailVerified && <MailCheck className="w-3 h-3 text-green-600" />}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(user)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onViewUser(user.id)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    title="View User Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};