import { Store, Users, CheckCircle, Clock } from "lucide-react";
import type { SellerStats } from "@/types/admin/sellers";
import { Loader } from "@/components/ui/Loader";

interface SellersStatsProps {
  stats?: SellerStats;
  isLoading?: boolean;
}

export default function SellersStats({ stats, isLoading }: SellersStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <Loader />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statsData = [
    {
      title: "Total Sellers",
      value: stats.total,
      icon: Store,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Sellers",
      value: stats.active,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending Approval",
      value: stats.pending,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Suspended",
      value: stats.suspended,
      icon: Users,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat) => (
        <div key={stat.title} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}