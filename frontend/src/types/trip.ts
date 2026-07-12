import { Driver } from './driver';
import { Vehicle } from './vehicle';

export type TripStatus = 'DRAFT' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED';

export interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeightKg: number;
  plannedDistanceKm: number;
  actualDistanceKm?: number | null;
  fuelConsumedL?: number | null;
  revenue: number;
  status: TripStatus;
  createdBy?: string | null;
  dispatchedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  vehicle?: Vehicle;
  driver?: Driver;
}
