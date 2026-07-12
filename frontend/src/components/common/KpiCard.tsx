import { LucideIcon } from 'lucide-react';
import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  color?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = 'text-primary bg-primary/10',
}) => {
  return (
    <div className="bg-card border border-border p-6 rounded-xl flex items-start justify-between shadow-sm hover:shadow-md transition-all duration-200">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
        <h3 className="text-3xl font-extrabold tracking-tight text-foreground">{value}</h3>
        {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
        {trend && (
          <span className="inline-flex text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded">
            {trend}
          </span>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
};
