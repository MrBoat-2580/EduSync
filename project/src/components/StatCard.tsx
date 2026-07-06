import type { ReactNode } from 'react';

type StatCardProps = {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  accent?: string; // tailwind gradient classes for the icon chip
};

// Compact metric tile used across the dashboard.
export default function StatCard({
  label,
  value,
  icon,
  trend,
  trendUp,
  accent = 'from-brand-500 to-brand-700',
}: StatCardProps) {
  return (
    <div className="card card-hover p-5 animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-ink-500">
            {label}
          </p>
          <p className="display mt-2 text-3xl font-bold text-ink-900">{value}</p>
        </div>
        <div
          className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-sm`}
        >
          {icon}
        </div>
      </div>
      {trend && (
        <p
          className={`mt-3 flex items-center gap-1 text-xs font-medium ${
            trendUp ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {trendUp ? '▲' : '▼'} {trend}
        </p>
      )}
    </div>
  );
}
