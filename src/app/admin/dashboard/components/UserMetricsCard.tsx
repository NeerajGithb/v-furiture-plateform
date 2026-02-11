import type { UserMetrics } from '@/types/admin/dashboard';
import MetricItem from './MetricItem';

interface UserMetricsCardProps {
  users: UserMetrics;
}

export default function UserMetricsCard({ users }: UserMetricsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">User Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricItem label="Total Users" value={users.totalUsers.toLocaleString('en-IN')} />
        <MetricItem label="Active Users" value={users.activeUsers.toLocaleString('en-IN')} />
        <MetricItem label="New Users" value={users.newUsers.toLocaleString('en-IN')} />
        <MetricItem label="Verified" value={users.verifiedUsers.toLocaleString('en-IN')} />
        <MetricItem label="Unverified" value={users.unverifiedUsers.toLocaleString('en-IN')} />
        <MetricItem label="Growth" value={`${users.userGrowth}%`} />
      </div>
    </div>
  );
}
