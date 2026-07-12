import type { EntityStatus, StatusTone } from './types';

export const gradientPrimary = 'linear-gradient(135deg, #6366F1 0%, #22D3EE 70%, #C471ED 100%)';

export const chartPalette = ['#6366F1', '#22D3EE', '#C471ED', '#34D399', '#FB7185'] as const;

export const semanticColors: Record<StatusTone, { color: string; glow: string; label: string }> = {
  healthy: { color: '#34D399', glow: 'rgba(52,211,153,0.35)', label: 'Healthy' },
  active: { color: '#22D3EE', glow: 'rgba(34,211,238,0.35)', label: 'Active' },
  pending: { color: '#FBBF24', glow: 'rgba(251,191,36,0.35)', label: 'Pending' },
  critical: { color: '#FB7185', glow: 'rgba(251,113,133,0.35)', label: 'Critical' },
  inactive: { color: '#64748B', glow: 'transparent', label: 'Inactive' },
};

export function getStatusTone(status: EntityStatus | string): StatusTone {
  switch (status) {
    case 'AVAILABLE':
    case 'COMPLETED':
      return 'healthy';
    case 'ON_TRIP':
    case 'DISPATCHED':
      return 'active';
    case 'IN_SHOP':
    case 'DRAFT':
      return 'pending';
    case 'SUSPENDED':
    case 'CANCELLED':
      return 'critical';
    case 'RETIRED':
    case 'OFF_DUTY':
      return 'inactive';
    default:
      return 'inactive';
  }
}

export function formatStatusLabel(status: string) {
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
