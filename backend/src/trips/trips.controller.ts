import { RoleName, TripStatus } from '../prisma-enums';
import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
;
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { PrismaService } from '../prisma/prisma.service';
import { CompleteTripDto } from './dto/complete-trip.dto';
import { CreateTripDto } from './dto/create-trip.dto';
import { TripsService } from './trips.service';

@Controller('trips')
@UseGuards(RolesGuard)
export class TripsController {
  constructor(
    private readonly tripsService: TripsService,
    private readonly prisma: PrismaService,
  ) {}

  @Roles(RoleName.DRIVER, RoleName.FLEET_MANAGER)
  @Post()
  create(@Body() dto: CreateTripDto, @CurrentUser() user: any) {
    return this.tripsService.create(dto, user.id);
  }

  @Get()
  async findAll(
    @Query('status') status?: TripStatus,
    @Query('search') search?: string,
    @CurrentUser() user?: any,
  ) {
    let driverId: string | undefined;

    if (user && user.role.name === RoleName.DRIVER) {
      const driver = await this.prisma.driver.findUnique({
        where: { userId: user.id },
      });
      if (!driver) {
        return [];
      }
      driverId = driver.id;
    }

    return this.tripsService.findAll({ status, search, driverId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  @Roles(RoleName.DRIVER, RoleName.FLEET_MANAGER)
  @Put(':id/dispatch')
  dispatch(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tripsService.dispatch(id, user.id);
  }

  @Roles(RoleName.DRIVER, RoleName.FLEET_MANAGER)
  @Put(':id/complete')
  complete(
    @Param('id') id: string,
    @Body() dto: CompleteTripDto,
    @CurrentUser() user: any,
  ) {
    return this.tripsService.complete(id, dto, user.id);
  }

  @Roles(RoleName.DRIVER, RoleName.FLEET_MANAGER)
  @Put(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tripsService.cancel(id, user.id);
  }
}
