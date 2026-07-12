/**
 * Usage:
 * const { pushToast } = useToast();
 * pushToast({ variant: 'success', title: 'Dispatch live', message: 'Trip TR-18 launched.' });
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastPayload {
  id?: string;
  variant: ToastVariant;
  title: string;
  message: string;
  durationMs?: number;
}

interface ToastContextValue {
  pushToast: (payload: ToastPayload) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantMap = {
  success: { icon: CheckCircle2, color: '#34D399' },
  error: { icon: AlertCircle, color: '#FB7185' },
  warning: { icon: AlertTriangle, color: '#FBBF24' },
  info: { icon: Info, color: '#22D3EE' },
} as const;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Required<ToastPayload>[]>([]);
  const reducedMotion = useReducedMotion();

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (payload: ToastPayload) => {
      const id = payload.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const durationMs = payload.durationMs ?? 4500;
      setToasts((current) => [...current, { ...payload, id, durationMs }]);
      window.setTimeout(() => dismissToast(id), durationMs);
    },
    [dismissToast],
  );

  const value = useMemo(() => ({ pushToast, dismissToast }), [dismissToast, pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[120] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => {
            const meta = variantMap[toast.variant];
            const Icon = meta.icon;
            return (
              <motion.div
                key={toast.id}
                initial={reducedMotion ? false : { opacity: 0, y: -20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.96 }}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
                className="pointer-events-auto overflow-hidden rounded-2xl border border-border bg-transit-surface2/95 shadow-glass backdrop-blur"
              >
                <div className="flex items-start gap-3 p-4">
                  <div className="mt-0.5 rounded-full p-2" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)` }}>
                    <Icon className="h-4 w-4" style={{ color: meta.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-foreground">{toast.title}</div>
                    <div className="mt-1 text-sm text-transit-text-secondary">{toast.message}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => dismissToast(toast.id)}
                    className="rounded-full p-1 text-transit-text-secondary transition hover:bg-white/5"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <motion.div
                  className="h-1 origin-left"
                  style={{ backgroundColor: meta.color }}
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: toast.durationMs / 1000, ease: 'linear' }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}

export function Toast(props: Omit<ToastPayload, 'id'>) {
  const { pushToast } = useToast();

  return (
    <button
      type="button"
      className={cn('rounded-xl border border-border px-3 py-2 text-sm text-foreground')}
      onClick={() => pushToast(props)}
    >
      Trigger toast
    </button>
  );
}
