import type { DashboardOverview } from '@/types/admin/dashboard';

interface OverviewStatsProps {
  overview: DashboardOverview;
}

export default function OverviewStats({ overview }: OverviewStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        title="Total Revenue"
        value={`₹${overview.totalRevenue.toLocaleString('en-IN')}`}
        growth={overview.revenueGrowth}
        subtitle={`Avg Order: ₹${overview.avgOrderValue.toFixed(2)}`}
      />
      <StatCard
        title="Total Orders"
        value={overview.totalOrders.toLocaleString('en-IN')}
        growth={overview.ordersGrowth}
        subtitle={`Conversion: ${overview.conversionRate.toFixed(1)}%`}
      />
      <StatCard
        title="Total Users"
        value={overview.totalUsers.toLocaleString('en-IN')}
        growth={overview.usersGrowth}
      />
      <StatCard
        title="Total Products"
        value={overview.totalProducts.toLocaleString('en-IN')}
      />
      <StatCard
        title="Total Sellers"
        value={overview.totalSellers.toLocaleString('en-IN')}
      />
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  growth, 
  subtitle 
}: { 
  title: string; 
  value: string; 
  growth?: number; 
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
      {growth !== undefined && (
        <p className={`text-sm ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {growth >= 0 ? '↑' : '↓'} {Math.abs(growth)}%
        </p>
      )}
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}
