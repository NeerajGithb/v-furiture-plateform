import React from 'react';
import { AdminUserStats } from '@/types/user';
import { 
  Users, 
  UserCheck, 
  UserX, 
  MailCheck 
} from 'lucide-react';

interface UsersStatsProps {
  stats?: AdminUserStats;
  isLoading: boolean;
}

export const UsersStats: React.FC<UsersStatsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          <div>
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <UserCheck className="w-8 h-8 text-green-600" />
          <div>
            <p className="text-sm text-gray-600">Verified</p>
            <p className="text-2xl font-bold text-gray-900">{stats.verifiedUsers}</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <UserX className="w-8 h-8 text-red-600" />
          <div>
            <p className="text-sm text-gray-600">Suspended</p>
            <p className="text-2xl font-bold text-gray-900">{stats.suspendedUsers}</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <MailCheck className="w-8 h-8 text-purple-600" />
          <div>
            <p className="text-sm text-gray-600">Email Verified</p>
            <p className="text-2xl font-bold text-gray-900">{stats.emailVerifiedUsers}</p>
          </div>
        </div>
      </div>
    </div>
  );
};