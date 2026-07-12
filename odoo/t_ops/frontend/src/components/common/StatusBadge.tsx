import React from 'react';
import { StatusPill } from '../ui/StatusPill';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return <StatusPill status={status} />;
};
