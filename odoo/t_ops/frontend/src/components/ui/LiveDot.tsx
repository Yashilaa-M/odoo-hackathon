/**
 * Usage:
 * <LiveDot status="ON_TRIP" pulsing />
 */
import { motion, useReducedMotion } from 'framer-motion';
import { getStatusTone, semanticColors } from '../../lib/tokens';
import type { EntityStatus } from '../../lib/types';

export interface LiveDotProps {
  pulsing?: boolean;
  status?: EntityStatus | string;
  className?: string;
}

export function LiveDot({ pulsing = true, status = 'ON_TRIP', className }: LiveDotProps) {
  const reducedMotion = useReducedMotion();
  const tone = getStatusTone(status);
  const color = semanticColors[tone];

  return (
    <motion.span
      aria-label={`${status} indicator`}
      className={className}
      style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        borderRadius: 9999,
        backgroundColor: color.color,
        boxShadow: `0 0 14px ${color.glow}`,
      }}
      animate={
        pulsing && !reducedMotion
          ? {
              scale: [1, 1.18, 1],
              opacity: [0.65, 1, 0.65],
            }
          : undefined
      }
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}
