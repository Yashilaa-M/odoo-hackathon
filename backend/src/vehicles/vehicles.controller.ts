import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehiclesService } from './vehicles.service';

@Controller('vehicles')
@UseGuards(RolesGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Roles(RoleName.FLEET_MANAGER)
  @Post()
  create(@Body() dto: CreateVehicleDto, @CurrentUser() user: any) {
    return this.vehiclesService.create(dto, user.id);
  }

  @Get()
  findAll(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('region') region?: string,
    @Query('search') search?: string,
  ) {
    return this.vehiclesService.findAll({ type, status, region, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Roles(RoleName.FLEET_MANAGER)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVehicleDto, @CurrentUser() user: any) {
    return this.vehiclesService.update(id, dto, user.id);
  }

  @Roles(RoleName.FLEET_MANAGER)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vehiclesService.remove(id, user.id);
  }
}
