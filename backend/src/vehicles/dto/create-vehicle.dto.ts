import { VehicleType, VehicleStatus } from '../../prisma-enums';
;
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  registrationNumber: string;

  @IsString()
  nameModel: string;

  @IsEnum(VehicleType)
  type: VehicleType;

  @IsNumber()
  @Min(0.1, { message: 'Max load capacity must be greater than 0 kg' })
  maxLoadCapacityKg: number;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Odometer reading cannot be negative' })
  odometerKm?: number;

  @IsNumber()
  @Min(0, { message: 'Acquisition cost cannot be negative' })
  acquisitionCost: number;

  @IsString()
  @IsOptional()
  region?: string;

  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus;
}
