/**
 * Usage:
 * <KPICard title="Fleet Utilization" value={78} suffix="%" trend="+6.1%" sparklineData={[54, 62, 78]} />
 */
import { TrendingDown, TrendingUp } from 'lucide-react';
import { CountUpNumber } from './CountUpNumber';
import { GlassCard } from './GlassCard';
import { cn } from '../../lib/utils';

export interface KPICardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  trend?: string;
  sparklineData?: number[];
  glowIntensity?: number;
  className?: string;
}

function Sparkline({ data }: { data: number[] }) {
  if (!data.length) return null;

  const width = 100;
  const height = 36;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((point, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * width;
      const y = height - ((point - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id="sparkline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke="url(#sparkline-gradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KPICard({
  title,
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  trend,
  sparklineData = [],
  glowIntensity = 0.35,
  className,
}: KPICardProps) {
  const positive = !trend || !trend.trim().startsWith('-');

  return (
    <GlassCard
      hoverLift
      className={cn('flex min-h-[180px] flex-col justify-between gap-4 overflow-hidden', className)}
      style={{ boxShadow: `0 18px 50px rgba(5, 6, 10, 0.28), 0 0 26px rgba(99,102,241,${glowIntensity})` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-transit-text-secondary">{title}</p>
          <div className="mt-3 text-4xl font-black tracking-tight text-foreground">
            <CountUpNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
          </div>
        </div>
        {trend ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
              positive ? 'border-emerald-400/25 text-emerald-300' : 'border-rose-400/25 text-rose-300',
            )}
          >
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend}
          </span>
        ) : null}
      </div>
      <div className="flex items-end justify-between gap-3">
        <p className="max-w-[12rem] text-sm text-transit-text-secondary">Realtime fleet metric with animation-safe fallback.</p>
        <Sparkline data={sparklineData} />
      </div>
    </GlassCard>
  );
}
