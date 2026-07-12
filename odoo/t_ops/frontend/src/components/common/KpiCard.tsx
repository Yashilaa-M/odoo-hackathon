import { LucideIcon } from 'lucide-react';
import React from 'react';
import { KPICard as TransitKpiCard } from '../ui/KPICard';

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
  description,
  trend,
  icon: _Icon,
  color: _color = 'text-primary bg-primary/10',
}) => {
  const numericValue = typeof value === 'number' ? value : Number.parseFloat(String(value).replace(/[^\d.-]/g, '')) || 0;
  const suffix = typeof value === 'string' && value.includes('%') ? '%' : '';

  return (
    <TransitKpiCard
      title={title}
      value={numericValue}
      suffix={suffix}
      trend={trend}
      sparklineData={description ? [18, 24, 22, 31, 30, numericValue || 26] : [12, 18, 15, 24, 21, numericValue || 18]}
      glowIntensity={0.22}
    />
  );
};
