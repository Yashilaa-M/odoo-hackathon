import { IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class CreateTripDto {
  @IsString()
  source: string;

  @IsString()
  destination: string;

  @IsUUID()
  vehicleId: string;

  @IsUUID()
  driverId: string;

  @IsNumber()
  @Min(0.1, { message: 'Cargo weight must be greater than 0 kg' })
  cargoWeightKg: number;

  @IsNumber()
  @Min(0.1, { message: 'Planned distance must be greater than 0 km' })
  plannedDistanceKm: number;

  @IsNumber()
  @Min(0, { message: 'Revenue cannot be negative' })
  revenue: number;
}
