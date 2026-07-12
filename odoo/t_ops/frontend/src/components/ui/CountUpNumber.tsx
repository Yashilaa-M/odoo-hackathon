/**
 * Usage:
 * <CountUpNumber value={128400} prefix="$" duration={900} />
 */
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export interface CountUpNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUpNumber({
  value,
  duration = 900,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}: CountUpNumberProps) {
  const reducedMotion = useReducedMotion();
  const previousValueRef = useRef(0);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (reducedMotion) {
      setDisplayValue(value);
      previousValueRef.current = value;
      return;
    }

    const start = previousValueRef.current;
    const startedAt = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = start + (value - start) * eased;
      setDisplayValue(next);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        previousValueRef.current = value;
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, reducedMotion, value]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
}
