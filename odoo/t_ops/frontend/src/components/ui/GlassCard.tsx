/**
 * Usage:
 * <GlassCard hoverLift glowStatus="ON_TRIP">...</GlassCard>
 */
import React from 'react';
import { getStatusTone, semanticColors } from '../../lib/tokens';
import type { EntityStatus } from '../../lib/types';
import { cn } from '../../lib/utils';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverLift?: boolean;
  glowStatus?: EntityStatus | string;
}

export function GlassCard({ className, hoverLift = false, glowStatus, style, ...props }: GlassCardProps) {
  const tone = glowStatus ? getStatusTone(glowStatus) : null;
  const glow = tone ? semanticColors[tone].glow : 'rgba(5, 6, 10, 0.18)';

  return (
    <div
      className={cn(
        'rounded-3xl border border-border bg-transit-surface2/78 p-5 text-foreground shadow-glass backdrop-blur-xl',
        hoverLift && 'transition duration-200 ease-out hover:-translate-y-1',
        className,
      )}
      style={{
        boxShadow: `0 18px 50px rgba(5, 6, 10, 0.28), 0 0 0 1px rgba(255,255,255,0.02), 0 0 24px ${glow}`,
        ...style,
      }}
      {...props}
    />
  );
}
