/**
 * Usage:
 * <Drawer open={open} title="Vehicle Diagnostics" side="right" onClose={() => setOpen(false)}>...</Drawer>
 */
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  side?: 'left' | 'right';
  children: React.ReactNode;
}

export function Drawer({ open, title, onClose, side = 'right', children }: DrawerProps) {
  const reducedMotion = useReducedMotion();
  const initialX = side === 'right' ? '100%' : '-100%';

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <AnimatePresence>
      {open ? (
        <Dialog.Portal forceMount>
          <Dialog.Overlay asChild>
            <motion.div
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          </Dialog.Overlay>
          <Dialog.Content asChild>
            <motion.aside
            className={cn(
              'fixed top-0 z-[101] h-full w-full max-w-xl border-border bg-transit-surface2 p-6 shadow-glass',
              side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
            )}
            initial={reducedMotion ? false : { x: initialX }}
            animate={{ x: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { x: initialX }}
            transition={{ duration: reducedMotion ? 0 : 0.25, ease: 'easeOut' }}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <Dialog.Title className="text-xl font-semibold text-foreground">{title}</Dialog.Title>
              <Dialog.Close className="rounded-full p-2 text-transit-text-secondary hover:bg-white/5" aria-label="Close drawer">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>
            {children}
            </motion.aside>
          </Dialog.Content>
        </Dialog.Portal>
      ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
