import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { MaintenanceStatus, RoleName } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CloseMaintenanceDto } from './dto/close-maintenance.dto';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { MaintenanceService } from './maintenance.service';

@Controller('maintenance')
@UseGuards(RolesGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Roles(RoleName.FLEET_MANAGER)
  @Post()
  create(@Body() dto: CreateMaintenanceDto, @CurrentUser() user: any) {
    return this.maintenanceService.create(dto, user.id);
  }

  @Get()
  findAll(
    @Query('vehicleId') vehicleId?: string,
    @Query('status') status?: MaintenanceStatus,
  ) {
    return this.maintenanceService.findAll({ vehicleId, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.maintenanceService.findOne(id);
  }

  @Roles(RoleName.FLEET_MANAGER)
  @Put(':id/close')
  close(
    @Param('id') id: string,
    @Body() dto: CloseMaintenanceDto,
    @CurrentUser() user: any,
  ) {
    return this.maintenanceService.close(id, dto, user.id);
  }
}
