import type { DashboardOverview } from '@/types/admin/dashboard';

interface OverviewStatsProps {
  overview: DashboardOverview;
}

export default function OverviewStats({ overview }: OverviewStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
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
  const getGrowthColor = (value: number) => {
    if (value > 0) return 'text-emerald-700 bg-emerald-50';
    if (value < 0) return 'text-rose-700 bg-rose-50';
    return 'text-slate-600 bg-slate-50';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 hover:border-slate-300 hover:shadow-md transition-all duration-200">
      <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">{title}</h3>
      <div className="flex items-baseline gap-2 mb-2">
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        {growth !== undefined && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${getGrowthColor(growth)}`}>
            {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
          </span>
        )}
      </div>
      {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
    </div>
  );
}
