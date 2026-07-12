import { RoleName, ExpenseCategory } from '../prisma-enums';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
;
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpensesService } from './expenses.service';

@Controller('expenses')
@UseGuards(RolesGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Roles(RoleName.FINANCIAL_ANALYST, RoleName.FLEET_MANAGER)
  @Post()
  create(@Body() dto: CreateExpenseDto, @CurrentUser() user: any) {
    return this.expensesService.create(dto, user.id);
  }

  @Get()
  findAll(
    @Query('vehicleId') vehicleId?: string,
    @Query('category') category?: ExpenseCategory,
  ) {
    return this.expensesService.findAll({ vehicleId, category });
  }
}
