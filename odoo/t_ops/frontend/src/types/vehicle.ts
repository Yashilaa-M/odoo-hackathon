export type VehicleType = 'TRUCK' | 'VAN' | 'BIKE';
export type VehicleStatus = 'AVAILABLE' | 'ON_TRIP' | 'IN_SHOP' | 'RETIRED';

export interface Vehicle {
  id: string;
  registrationNumber: string;
  nameModel: string;
  type: VehicleType;
  maxLoadCapacityKg: number;
  odometerKm: number;
  acquisitionCost: number;
  region?: string | null;
  status: VehicleStatus;
  createdAt: string;
  updatedAt: string;
}
