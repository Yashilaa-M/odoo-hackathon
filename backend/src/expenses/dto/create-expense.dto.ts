import { ExpenseCategory } from '@prisma/client';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateExpenseDto {
  @IsUUID()
  vehicleId: string;

  @IsUUID()
  @IsOptional()
  tripId?: string;

  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @IsNumber()
  @Min(0, { message: 'Expense amount cannot be negative' })
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  incurredDate: string;
}
