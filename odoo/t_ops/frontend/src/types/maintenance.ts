import { Vehicle } from './vehicle';

export type MaintenanceStatus = 'ACTIVE' | 'CLOSED';

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  type: string;
  description?: string | null;
  cost: number;
  status: MaintenanceStatus;
  openedAt: string;
  closedAt?: string | null;
  createdBy?: string | null;
  vehicle?: Vehicle;
}
