/**
 * Usage:
 * <StatusPill status="ON_TRIP" />
 */
import React from 'react';
import { AlertTriangle, CheckCircle2, Clock3, Dot, PauseCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatStatusLabel, getStatusTone, semanticColors } from '../../lib/tokens';
import type { EntityStatus, StatusTone } from '../../lib/types';

export interface StatusPillProps {
  status: EntityStatus | string;
  label?: string;
  tone?: StatusTone;
  className?: string;
}

const iconMap: Record<StatusTone, React.ReactNode> = {
  healthy: <CheckCircle2 className="h-3.5 w-3.5" />,
  active: <Dot className="h-4 w-4" />,
  pending: <Clock3 className="h-3.5 w-3.5" />,
  critical: <AlertTriangle className="h-3.5 w-3.5" />,
  inactive: <PauseCircle className="h-3.5 w-3.5" />,
};

export function StatusPill({ status, label, tone, className }: StatusPillProps) {
  const resolvedTone = tone ?? getStatusTone(status);
  const token = semanticColors[resolvedTone];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]',
        className,
      )}
      style={{
        color: token.color,
        borderColor: `color-mix(in srgb, ${token.color} 32%, var(--border-subtle))`,
        backgroundColor: `color-mix(in srgb, ${token.color} 14%, transparent)`,
        boxShadow: token.glow === 'transparent' ? 'none' : `0 0 18px ${token.glow}`,
      }}
    >
      <span aria-hidden="true">{iconMap[resolvedTone]}</span>
      <span>{label ?? formatStatusLabel(status)}</span>
    </span>
  );
}

export default StatusPill;
