import { Users, UserCheck, UserPlus } from 'lucide-react';
import { UserAnalytics } from '@/types/admin/analytics';

interface UserMetricsProps {
  userAnalytics: UserAnalytics;
}

export default function UserMetrics({ userAnalytics }: UserMetricsProps) {
  const metrics = [
    { label: 'New Users', value: userAnalytics.newUsers.toLocaleString('en-IN'), icon: UserPlus, bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: 'Active Users', value: userAnalytics.activeUsers.toLocaleString('en-IN'), icon: Users, bg: 'bg-green-50', color: 'text-green-600' },
    { label: 'Returning Users', value: userAnalytics.returningUsers.toLocaleString('en-IN'), icon: UserCheck, bg: 'bg-purple-50', color: 'text-purple-600' },
    { label: 'Retention Rate', value: `${userAnalytics.userRetentionRate.toFixed(1)}%`, icon: UserCheck, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="p-4 border border-gray-100 rounded-lg bg-white flex flex-col items-center text-center">
            <div className={`p-2 rounded-full mb-2 ${metric.bg}`}>
              <metric.icon className={`w-5 h-5 ${metric.color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
            <div className="text-xs font-medium text-gray-500 mt-1">{metric.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
