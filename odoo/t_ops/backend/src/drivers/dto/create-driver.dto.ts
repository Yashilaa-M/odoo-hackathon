import { DriverStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateDriverDto {
  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  fullName: string;

  @IsString()
  licenseNumber: string;

  @IsString()
  licenseCategory: string;

  @IsDateString()
  licenseExpiryDate: string;

  @IsString()
  contactNumber: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  safetyScore?: number;

  @IsEnum(DriverStatus)
  @IsOptional()
  status?: DriverStatus;
}
