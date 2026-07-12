/**
 * Usage:
 * <AchievementBadge title="Zero Downtime" description="30 days road-ready" icon={<ShieldCheck />} unlocked />
 */
import React from 'react';
import { Lock } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface AchievementBadgeProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked?: boolean;
  className?: string;
}

export function AchievementBadge({
  title,
  description,
  icon,
  unlocked = false,
  className,
}: AchievementBadgeProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-border p-4',
        unlocked ? 'bg-transit-surface2 text-foreground' : 'bg-transit-surface3/60 text-transit-text-secondary',
        className,
      )}
    >
      {unlocked ? (
        <div className="absolute inset-0 rounded-3xl p-[1px]" style={{ background: 'var(--gradient-primary)' }}>
          <div className="h-full w-full rounded-3xl bg-transit-surface2/95" />
        </div>
      ) : null}
      <div className="relative flex items-start gap-3">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-transit-surface3">
          {icon}
          {!unlocked ? (
            <div className="absolute -right-1 -top-1 rounded-full bg-transit-surface1 p-1">
              <Lock className="h-3.5 w-3.5" />
            </div>
          ) : null}
          {unlocked && !reducedMotion ? (
            <span className="pointer-events-none absolute inset-y-0 left-0 w-8 -translate-x-full animate-shimmer bg-white/20 blur-md" />
          ) : null}
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-transit-text-secondary">{description}</p>
        </div>
      </div>
    </div>
  );
}
