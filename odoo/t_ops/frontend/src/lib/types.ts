export type VehicleStatus = 'AVAILABLE' | 'ON_TRIP' | 'IN_SHOP' | 'RETIRED';
export type DriverStatus = 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY' | 'SUSPENDED';
export type TripStatus = 'DRAFT' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED';

export type EntityStatus = VehicleStatus | DriverStatus | TripStatus;
export type StatusTone = 'healthy' | 'active' | 'pending' | 'critical' | 'inactive';

export interface SelectOption<TValue extends string = string> {
  value: TValue;
  label: string;
  description?: string;
}
