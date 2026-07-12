/**
 * Usage:
 * <CapacityTube current={4700} max={5000} orientation="horizontal" />
 */
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface CapacityTubeProps {
  current: number;
  max: number;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export function CapacityTube({
  current,
  max,
  orientation = 'vertical',
  className,
}: CapacityTubeProps) {
  const reducedMotion = useReducedMotion();
  const ratio = max <= 0 ? 0 : current / max;
  const percentage = Math.max(0, Math.min(ratio * 100, 120));
  const overflow = ratio > 1;
  const tone = ratio >= 1 ? '#FB7185' : ratio >= 0.8 ? '#FBBF24' : '#34D399';

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'relative overflow-hidden rounded-[999px] border border-border bg-transit-surface3',
          orientation === 'vertical' ? 'h-40 w-6' : 'h-6 w-full',
          overflow && !reducedMotion && 'animate-tube-shake',
        )}
      >
        <motion.div
          className={cn(
            'absolute rounded-[999px]',
            orientation === 'vertical' ? 'bottom-0 left-0 w-full' : 'left-0 top-0 h-full',
          )}
          initial={false}
          animate={
            orientation === 'vertical'
              ? { height: `${Math.min(percentage, 100)}%` }
              : { width: `${Math.min(percentage, 100)}%` }
          }
          transition={{ duration: reducedMotion ? 0 : 0.45, ease: 'easeOut' }}
          style={{
            background: `linear-gradient(180deg, ${tone}, color-mix(in srgb, ${tone} 70%, white))`,
            boxShadow: `0 0 16px color-mix(in srgb, ${tone} 35%, transparent)`,
          }}
        />
      </div>
      <div className="text-sm text-transit-text-secondary">
        <div className="font-semibold text-foreground">
          {current} / {max}
        </div>
        <div>{overflow ? 'Over capacity' : `${Math.round(Math.min(percentage, 100))}% utilized`}</div>
      </div>
    </div>
  );
}
