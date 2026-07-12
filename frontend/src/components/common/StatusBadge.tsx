import React from 'react';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = status.toUpperCase().replace('_', '');

  let styles = 'bg-gray-100 text-gray-800';

  if (normalized === 'AVAILABLE') {
    styles = 'bg-status-available-bg text-status-available-text border border-emerald-200/30';
  } else if (normalized === 'ONTRIP' || normalized === 'DISPATCHED') {
    styles = 'bg-status-ontrip-bg text-status-ontrip-text border border-blue-200/30';
  } else if (normalized === 'INSHOP' || normalized === 'ACTIVE') {
    styles = 'bg-status-inshop-bg text-status-inshop-text border border-amber-200/30';
  } else if (normalized === 'RETIRED' || normalized === 'CANCELLED' || normalized === 'DRAFT') {
    styles = 'bg-status-retired-bg text-status-retired-text border border-gray-200/30';
  } else if (normalized === 'SUSPENDED' || normalized === 'OFFDUTY') {
    styles = 'bg-status-suspended-bg text-status-suspended-text border border-red-200/30';
  } else if (normalized === 'COMPLETED') {
    styles = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/30';
  }

  const label = status.replace('_', ' ');

  return (
    <span className={cn("inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider", styles)}>
      {label}
    </span>
  );
};
