interface MetricItemProps {
  label: string;
  value: string;
  className?: string;
}

export default function MetricItem({ label, value, className = '' }: MetricItemProps) {
  return (
    <div className="text-center">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className={`text-xl font-semibold ${className}`}>{value}</p>
    </div>
  );
}
