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
    if (value > 0) return 'text-[#059669] bg-[#ECFDF5]';
    if (value < 0) return 'text-[#DC2626] bg-[#FEF2F2]';
    return 'text-[#555555] bg-[#F1F3F5]';
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 hover:border-[#D1D5DB] hover:shadow-md transition-all duration-200">
      <h3 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">{title}</h3>
      <div className="flex items-baseline gap-2 mb-1.5">
        <p className="text-[28px] font-semibold text-[#111111] tracking-tight">{value}</p>
        {growth !== undefined && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${getGrowthColor(growth)}`}>
            {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
          </span>
        )}
      </div>
      {subtitle && <p className="text-[13px] text-[#6B7280] font-normal">{subtitle}</p>}
    </div>
  );
}
