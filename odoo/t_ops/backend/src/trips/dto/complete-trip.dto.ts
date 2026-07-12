import { IsNumber, Min } from 'class-validator';

export class CompleteTripDto {
  @IsNumber()
  @Min(0.1, { message: 'Actual distance must be greater than 0 km' })
  actualDistanceKm: number;

  @IsNumber()
  @Min(0.1, { message: 'Fuel consumed must be greater than 0 liters' })
  fuelConsumedL: number;
}
