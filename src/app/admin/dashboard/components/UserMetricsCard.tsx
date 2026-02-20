import type { UserMetrics } from '@/types/admin/dashboard';
import MetricItem from './MetricItem';

interface UserMetricsCardProps {
  users: UserMetrics;
}

export default function UserMetricsCard({ users }: UserMetricsCardProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
      <h2 className="text-[15px] font-semibold text-[#111111] mb-5 tracking-tight">User Metrics</h2>
      <div className="flex flex-wrap gap-6">
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
