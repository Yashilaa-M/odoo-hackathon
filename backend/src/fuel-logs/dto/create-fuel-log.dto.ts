import { IsDateString, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateFuelLogDto {
  @IsUUID()
  vehicleId: string;

  @IsUUID()
  @IsOptional()
  tripId?: string;

  @IsNumber()
  @Min(0.1, { message: 'Fuel volume must be greater than 0 liters' })
  liters: number;

  @IsNumber()
  @Min(0, { message: 'Fuel cost cannot be negative' })
  cost: number;

  @IsDateString()
  loggedDate: string;
}
