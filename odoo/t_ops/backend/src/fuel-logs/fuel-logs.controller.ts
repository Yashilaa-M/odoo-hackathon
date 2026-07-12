import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateFuelLogDto } from './dto/create-fuel-log.dto';
import { FuelLogsService } from './fuel-logs.service';

@Controller('fuel-logs')
@UseGuards(RolesGuard)
export class FuelLogsController {
  constructor(private readonly fuelLogsService: FuelLogsService) {}

  @Roles(RoleName.FINANCIAL_ANALYST, RoleName.FLEET_MANAGER)
  @Post()
  create(@Body() dto: CreateFuelLogDto, @CurrentUser() user: any) {
    return this.fuelLogsService.create(dto, user.id);
  }

  @Get()
  findAll(@Query('vehicleId') vehicleId?: string) {
    return this.fuelLogsService.findAll({ vehicleId });
  }
}
