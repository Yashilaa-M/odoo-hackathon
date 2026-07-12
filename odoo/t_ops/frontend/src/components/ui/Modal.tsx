/**
 * Usage:
 * <Modal open={open} title="Dispatch Confirmation" onClose={() => setOpen(false)}>...</Modal>
 */
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';

export interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  const reducedMotion = useReducedMotion();

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <AnimatePresence>
      {open ? (
        <Dialog.Portal forceMount>
          <Dialog.Overlay asChild>
            <motion.div
              className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-sm"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          </Dialog.Overlay>
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <Dialog.Content asChild>
              <motion.div
            className="w-full max-w-2xl rounded-[28px] border border-border bg-transit-surface2 p-6 shadow-glass"
            initial={reducedMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 12 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <Dialog.Title className="text-xl font-semibold text-foreground">{title}</Dialog.Title>
              <Dialog.Close className="rounded-full p-2 text-transit-text-secondary hover:bg-white/5" aria-label="Close modal">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>
            {children}
              </motion.div>
            </Dialog.Content>
          </div>
        </Dialog.Portal>
      ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
