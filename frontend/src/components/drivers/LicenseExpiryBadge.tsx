import { AlertTriangle } from 'lucide-react';
import React from 'react';

interface LicenseExpiryBadgeProps {
  expiryDate: string;
}

export const LicenseExpiryBadge: React.FC<LicenseExpiryBadgeProps> = ({ expiryDate }) => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return (
      <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 border border-red-200/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
        <AlertTriangle className="h-3 w-3" /> EXPIRED
      </span>
    );
  }

  if (diffDays <= 30) {
    return (
      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
        <AlertTriangle className="h-3 w-3" /> EXPIRES IN {diffDays}D
      </span>
    );
  }

  return (
    <span className="inline-flex items-center bg-gray-100 text-gray-800 dark:bg-gray-950/40 dark:text-gray-400 border border-gray-200/20 px-2 py-0.5 rounded-full text-[10px] font-semibold">
      Valid
    </span>
  );
};
