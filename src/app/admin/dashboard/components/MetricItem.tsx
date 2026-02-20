interface MetricItemProps {
  label: string;
  value: string;
  className?: string;
}

export default function MetricItem({ label, value, className = '' }: MetricItemProps) {
  return (
    <div className="border-l border-[#E5E7EB] pl-4 first:border-l-0 first:pl-0">
      <p className="text-[11px] text-[#6B7280] mb-1.5 font-medium uppercase tracking-wider">{label}</p>
      <p className={`text-[20px] font-semibold text-[#111111] tracking-tight ${className}`}>{value}</p>
    </div>
  );
}
