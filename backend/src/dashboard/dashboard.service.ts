import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface KpiFilters {
  type?: string;
  status?: string;
  region?: string;
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getKpis(filters: KpiFilters = {}) {
    // Build vehicle where clause for filters
    const vehicleWhere: any = {};
    if (filters.type) vehicleWhere.type = filters.type;
    if (filters.region) vehicleWhere.region = { contains: filters.region, mode: 'insensitive' };

    const activeVehicles = await this.prisma.vehicle.count({
      where: { ...vehicleWhere, status: 'ON_TRIP' },
    });
    const availableVehicles = await this.prisma.vehicle.count({
      where: { ...vehicleWhere, status: 'AVAILABLE' },
    });
    const inShopVehicles = await this.prisma.vehicle.count({
      where: { ...vehicleWhere, status: 'IN_SHOP' },
    });

    const activeTrips = await this.prisma.trip.count({ where: { status: 'DISPATCHED' } });
    const pendingTrips = await this.prisma.trip.count({ where: { status: 'DRAFT' } });

    const driversOnDuty = await this.prisma.driver.count({
      where: { status: { in: ['AVAILABLE', 'ON_TRIP'] } },
    });

    // Fleet Utilization % = (Vehicles ON_TRIP / Total non-retired vehicles) * 100
    const totalNonRetired = activeVehicles + availableVehicles + inShopVehicles;
    const fleetUtilization =
      totalNonRetired > 0 ? (activeVehicles / totalNonRetired) * 100 : 0;

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
