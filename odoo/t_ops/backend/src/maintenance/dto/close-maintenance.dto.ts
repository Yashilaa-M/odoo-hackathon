import { IsNumber, Min } from 'class-validator';

export class CloseMaintenanceDto {
  @IsNumber()
  @Min(0, { message: 'Final maintenance cost cannot be negative' })
  cost: number;
}
