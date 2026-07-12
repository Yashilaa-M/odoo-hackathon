import { RoleName } from '../prisma-enums';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
;
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DriversService } from './drivers.service';

@Controller('drivers')
@UseGuards(RolesGuard)
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Roles(RoleName.SAFETY_OFFICER, RoleName.FLEET_MANAGER)
  @Post()
  create(@Body() dto: CreateDriverDto, @CurrentUser() user: any) {
    return this.driversService.create(dto, user.id);
  }

  @Get()
  findAll(@Query('status') status?: string, @Query('search') search?: string) {
    return this.driversService.findAll({ status, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.driversService.findOne(id);
  }

  @Roles(RoleName.SAFETY_OFFICER, RoleName.FLEET_MANAGER)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDriverDto, @CurrentUser() user: any) {
    return this.driversService.update(id, dto, user.id);
  }

  @Roles(RoleName.SAFETY_OFFICER, RoleName.FLEET_MANAGER)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.driversService.remove(id, user.id);
  }
}
