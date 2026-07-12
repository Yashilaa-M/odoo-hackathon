/**
 * Usage:
 * <RouteMapDot progress={tripProgress} durationMs={1200} />
 */
import { motion, useReducedMotion } from 'framer-motion';

export interface RouteMapDotProps {
  progress: number;
  durationMs?: number;
  className?: string;
}

export function RouteMapDot({ progress, durationMs = 1200, className }: RouteMapDotProps) {
  const reducedMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(1, progress));
  const x = 20 + clamped * 260;
  const y = 90 - Math.sin(clamped * Math.PI) * 54;

  return (
    <svg viewBox="0 0 300 120" className={className}>
      <path
        d="M20 90 C 80 8, 160 10, 280 84"
        fill="none"
        stroke="rgba(154,163,184,0.24)"
        strokeWidth="3"
        strokeDasharray="8 8"
      />
      <motion.circle
        r="8"
        fill="#22D3EE"
        stroke="#F4F6FB"
        strokeWidth="2"
        initial={false}
        animate={{ cx: x, cy: y }}
        transition={{ duration: reducedMotion ? 0 : durationMs / 1000, ease: 'easeInOut' }}
        style={{ filter: 'drop-shadow(0 0 10px rgba(34,211,238,0.45))' }}
      />
    </svg>
  );
}
