'use client';

import { TrendingUp, TrendingDown, DollarSign, CreditCard, Clock, Package, Percent, ShoppingBag, Minus } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { EarningsSummaryProps } from '@/types/seller/earnings';

const DOT_COLOR: Record<string, string> = {
  'Total Revenue': 'bg-[#111111]',
  'Available Balance': 'bg-emerald-400',
  'Pending Revenue': 'bg-amber-400',
  'Platform Fees': 'bg-[#9CA3AF]',
  'Net Earnings': 'bg-blue-400',
  'Total Orders': 'bg-violet-400',
  'Avg Order Value': 'bg-indigo-400',
};

function GrowthChip({ growth }: { growth: number }) {
  if (growth === 0) return <span className="text-[11px] font-semibold text-[#9CA3AF] flex items-center gap-0.5"><Minus className="w-3 h-3" />0%</span>;
  const positive = growth > 0;
  return (
    <span className={`text-[11px] font-semibold flex items-center gap-0.5 ${positive ? 'text-emerald-600' : 'text-rose-500'}`}>
      {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {positive ? '+' : ''}{growth.toFixed(1)}%
    </span>
  );
}

export default function EarningsSummary({ summary }: EarningsSummaryProps) {
  const metrics = [
    { title: 'Total Revenue', value: formatCurrency(summary?.totalRevenue || 0), icon: DollarSign, growth: summary?.growth, desc: 'All-time earnings' },
    { title: 'Available Balance', value: formatCurrency(summary?.completedRevenue || 0), icon: CreditCard, desc: 'Ready for payout' },
    { title: 'Pending Revenue', value: formatCurrency(summary?.pendingRevenue || 0), icon: Clock, desc: 'Processing orders' },
    { title: 'Platform Fees', value: formatCurrency(summary?.platformFees || 0), icon: Percent, desc: 'Commission deducted' },
  ];

  const extra = [
    summary?.netEarnings !== undefined && { title: 'Net Earnings', value: formatCurrency(summary.netEarnings), icon: Package, desc: 'After platform fees' },
    summary?.totalOrders !== undefined && { title: 'Total Orders', value: summary.totalOrders.toLocaleString(), icon: ShoppingBag, desc: 'Orders completed' },
    summary?.averageOrderValue !== undefined && { title: 'Avg Order Value', value: formatCurrency(summary.averageOrderValue), icon: TrendingUp, desc: 'Per order average' },
  ].filter(Boolean) as { title: string; value: string; icon: any; desc: string }[];

  const breakdownRows = summary ? [
    { label: 'Available Balance', value: summary.completedRevenue || 0, dot: 'bg-emerald-400' },
    { label: 'Pending Revenue', value: summary.pendingRevenue || 0, dot: 'bg-amber-400' },
    { label: 'Platform Fees', value: summary.platformFees || 0, dot: 'bg-[#9CA3AF]' },
  ] : [];
  const total = summary?.totalRevenue || 1;

  return (
    <div className="space-y-5">
      {/* Primary stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.title} className="bg-white border border-[#E5E7EB] rounded-lg p-5 hover:border-[#D1D5DB] hover:shadow-sm transition-all duration-150">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">{m.title}</span>
              <div className="w-7 h-7 bg-[#F8F9FA] border border-[#F3F4F6] rounded-md flex items-center justify-center">
                <m.icon className="w-3.5 h-3.5 text-[#6B7280]" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${DOT_COLOR[m.title]}`} />
                <span className="text-[22px] font-bold text-[#111111] tabular-nums leading-none truncate">{m.value}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-[#9CA3AF]">{m.desc}</span>
              {m.growth !== undefined && <GrowthChip growth={m.growth} />}
            </div>
          </div>
        ))}
      </div>

      {/* Extra metrics */}
      {extra.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {extra.map((m) => (
            <div key={m.title} className="bg-white border border-[#E5E7EB] rounded-lg p-5 hover:border-[#D1D5DB] hover:shadow-sm transition-all duration-150">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">{m.title}</span>
                <div className="w-7 h-7 bg-[#F8F9FA] border border-[#F3F4F6] rounded-md flex items-center justify-center">
                  <m.icon className="w-3.5 h-3.5 text-[#6B7280]" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${DOT_COLOR[m.title] || 'bg-[#9CA3AF]'}`} />
                <span className="text-[20px] font-bold text-[#111111] tabular-nums leading-none truncate">{m.value}</span>
              </div>
              <p className="text-[11px] text-[#9CA3AF] mt-1.5">{m.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Revenue Breakdown */}
      {summary && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg">
          <div className="px-5 py-4 border-b border-[#F3F4F6]">
            <h3 className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Revenue Breakdown</h3>
          </div>
          <div className="px-5 py-4 space-y-4">
            {breakdownRows.map((row) => {
              const pct = total > 0 ? Math.min((row.value / total) * 100, 100) : 0;
              return (
                <div key={row.label}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${row.dot}`} />
                      <span className="text-[12px] text-[#555555] font-medium">{row.label}</span>
                    </div>
                    <span className="text-[12px] font-semibold text-[#111111] tabular-nums">{formatCurrency(row.value)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${row.dot}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="flex justify-between items-center pt-3 border-t border-[#F3F4F6]">
              <span className="text-[12px] font-semibold text-[#111111]">Total Revenue</span>
              <div className="flex items-center gap-3">
                {summary.growth !== undefined && <GrowthChip growth={summary.growth} />}
                <span className="text-[16px] font-bold text-[#111111] tabular-nums">{formatCurrency(summary.totalRevenue || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}