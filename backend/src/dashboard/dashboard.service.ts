import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getKpis() {
    const activeVehicles = await this.prisma.vehicle.count({ where: { status: 'ON_TRIP' } });
    const availableVehicles = await this.prisma.vehicle.count({ where: { status: 'AVAILABLE' } });
    const inShopVehicles = await this.prisma.vehicle.count({ where: { status: 'IN_SHOP' } });

    const activeTrips = await this.prisma.trip.count({ where: { status: 'DISPATCHED' } });
    const pendingTrips = await this.prisma.trip.count({ where: { status: 'DRAFT' } });

    const driversOnDuty = await this.prisma.driver.count({
      where: { status: { in: ['AVAILABLE', 'ON_TRIP'] } },
    });

    // Fleet Utilization % = (Vehicles ON_TRIP / Total non-retired vehicles) * 100
    const totalNonRetired = activeVehicles + availableVehicles + inShopVehicles;
    const fleetUtilization = totalNonRetired > 0 ? (activeVehicles / totalNonRetired) * 100 : 0;

    return {
      activeVehicles,
      availableVehicles,
      inShopVehicles,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilization: parseFloat(fleetUtilization.toFixed(2)),
    };
  }
}
