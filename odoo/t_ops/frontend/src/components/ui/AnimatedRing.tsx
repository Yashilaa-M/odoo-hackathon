/**
 * Usage:
 * <AnimatedRing value={82} label="Fleet Utilization" size="large" />
 */
import { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { gradientPrimary } from '../../lib/tokens';
import { cn } from '../../lib/utils';

export interface AnimatedRingProps {
  value: number;
  label: string;
  size?: 'compact' | 'large';
  color?: string;
  className?: string;
}

export function AnimatedRing({
  value,
  label,
  size = 'compact',
  color = gradientPrimary,
  className,
}: AnimatedRingProps) {
  const reducedMotion = useReducedMotion();
  const gradientId = useId();
  const normalized = Math.max(0, Math.min(100, value));
  const diameter = size === 'large' ? 220 : 132;
  const strokeWidth = size === 'large' ? 14 : 10;
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - normalized / 100);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={diameter} height={diameter} viewBox={`0 0 ${diameter} ${diameter}`} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="70%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#C471ED" />
          </linearGradient>
        </defs>
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          stroke="rgba(154,163,184,0.18)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {size === 'large' &&
          Array.from({ length: 24 }).map((_, index) => {
            const angle = (index / 24) * Math.PI * 2;
            const inner = radius + 10;
            const outer = radius + 18;
            const center = diameter / 2;
            return (
              <line
                key={index}
                x1={center + inner * Math.cos(angle)}
                y1={center + inner * Math.sin(angle)}
                x2={center + outer * Math.cos(angle)}
                y2={center + outer * Math.sin(angle)}
                stroke="rgba(154,163,184,0.28)"
                strokeWidth="2"
              />
            );
          })}
        <motion.circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          stroke={color.includes('linear-gradient') ? `url(#${gradientId})` : color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: reducedMotion ? dashOffset : dashOffset }}
          transition={{ duration: reducedMotion ? 0 : 1, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 12px rgba(34,211,238,0.35))` }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={cn('font-black text-foreground', size === 'large' ? 'text-5xl' : 'text-3xl')}>
          {normalized}
          <span className="text-lg text-transit-text-secondary">%</span>
        </span>
        <span className="mt-2 max-w-[11rem] text-[11px] uppercase tracking-[0.24em] text-transit-text-secondary">
          {label}
        </span>
      </div>
    </div>
  );
}
