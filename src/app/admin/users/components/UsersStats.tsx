import React from 'react';
import type { UserStats } from '@/types/admin/users';
import { 
  Users, 
  UserCheck, 
  UserX, 
  MailCheck 
} from 'lucide-react';

interface UsersStatsProps {
  stats: UserStats;
}

export const UsersStats: React.FC<UsersStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          <div>
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <UserCheck className="w-8 h-8 text-green-600" />
          <div>
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <UserX className="w-8 h-8 text-red-600" />
          <div>
            <p className="text-sm text-gray-600">Suspended</p>
            <p className="text-2xl font-bold text-gray-900">{stats.suspended}</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <MailCheck className="w-8 h-8 text-purple-600" />
          <div>
            <p className="text-sm text-gray-600">Verified</p>
            <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
          </div>
        </div>
      </div>
    </div>
  );
};