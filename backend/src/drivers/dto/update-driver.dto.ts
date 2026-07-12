import { DriverStatus } from '../../prisma-enums';
;
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class UpdateDriverDto {
  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsString()
  @IsOptional()
  licenseCategory?: string;

  @IsDateString()
  @IsOptional()
  licenseExpiryDate?: string;

  @IsString()
  @IsOptional()
  contactNumber?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  safetyScore?: number;

  @IsEnum(DriverStatus)
  @IsOptional()
  status?: DriverStatus;
}
