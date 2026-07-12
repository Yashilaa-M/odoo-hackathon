import { Trip } from './trip';
import { Vehicle } from './vehicle';

export interface FuelLog {
  id: string;
  vehicleId: string;
  tripId?: string | null;
  liters: number;
  cost: number;
  loggedDate: string;
  createdBy?: string | null;
  vehicle?: Vehicle;
  trip?: Trip;
}
