import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateMaintenanceDto {
  @IsUUID()
  vehicleId: string;

  @IsString()
  type: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0, { message: 'Initial estimated cost cannot be negative' })
  cost: number;
}
