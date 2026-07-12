import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getReports() {
    const vehicles = await this.prisma.vehicle.findMany({
      include: {
        trips: {
          where: { status: 'COMPLETED' },
        },
        fuelLogs: true,
        maintenanceLogs: {
          where: { status: 'CLOSED' },
        },
        expenses: true,
      },
    });

    const fleetTotalDistance = vehicles.reduce(
      (sum, v) => sum + v.trips.reduce((s, t) => s + Number(t.actualDistanceKm || 0), 0),
      0,
    );
    const fleetTotalFuel = vehicles.reduce(
      (sum, v) => sum + v.trips.reduce((s, t) => s + Number(t.fuelConsumedL || 0), 0),
      0,
    );
    const fleetFuelEfficiency = fleetTotalFuel > 0 ? fleetTotalDistance / fleetTotalFuel : 0;

    const reports = vehicles.map((vehicle) => {
      const totalDistance = vehicle.trips.reduce((s, t) => s + Number(t.actualDistanceKm || 0), 0);
      const totalFuel = vehicle.trips.reduce((s, t) => s + Number(t.fuelConsumedL || 0), 0);
      const totalRevenue = vehicle.trips.reduce((s, t) => s + Number(t.revenue || 0), 0);

      const fuelCost = vehicle.fuelLogs.reduce((s, f) => s + Number(f.cost || 0), 0);
      const maintenanceCost = vehicle.maintenanceLogs.reduce((s, m) => s + Number(m.cost || 0), 0);

      // totalOperationalCost is computed as the sum of all incurred expenses.
      // Since fuel-logs and closed-maintenance logs automatically insert expense entries,
      // this sum includes everything.
      const totalOperationalCost = vehicle.expenses.reduce((s, e) => s + Number(e.amount || 0), 0);

      // Fuel Efficiency = Total Distance / Total Fuel Consumed
      const fuelEfficiency = totalFuel > 0 ? totalDistance / totalFuel : 0;

      // Vehicle ROI = (Revenue - Operational Cost) / Acquisition Cost
      const acqCost = Number(vehicle.acquisitionCost || 0);
      const roi = acqCost > 0 ? (totalRevenue - totalOperationalCost) / acqCost : 0;

      return {
        id: vehicle.id,
        registrationNumber: vehicle.registrationNumber,
        nameModel: vehicle.nameModel,
        type: vehicle.type,
        acquisitionCost: acqCost,
        totalDistance: parseFloat(totalDistance.toFixed(2)),
        totalFuelConsumed: parseFloat(totalFuel.toFixed(2)),
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        fuelCost: parseFloat(fuelCost.toFixed(2)),
        maintenanceCost: parseFloat(maintenanceCost.toFixed(2)),
        totalOperationalCost: parseFloat(totalOperationalCost.toFixed(2)),
        fuelEfficiency: parseFloat(fuelEfficiency.toFixed(2)),
        roi: parseFloat(roi.toFixed(4)),
      };
    });

    return {
      fleet: {
        totalDistance: parseFloat(fleetTotalDistance.toFixed(2)),
        totalFuel: parseFloat(fleetTotalFuel.toFixed(2)),
        fuelEfficiency: parseFloat(fleetFuelEfficiency.toFixed(2)),
      },
      vehicles: reports,
    };
  }

  generateCSV(reportData: any): string {
    const headers = [
      'Registration Number',
      'Name/Model',
      'Type',
      'Acquisition Cost ($)',
      'Total Distance (km)',
      'Total Fuel (L)',
      'Total Revenue ($)',
      'Total Operational Cost ($)',
      'Fuel Efficiency (km/L)',
      'ROI (%)',
    ];

    const rows = reportData.vehicles.map((v: any) => [
      v.registrationNumber,
      `"${v.nameModel}"`,
      v.type,
      v.acquisitionCost,
      v.totalDistance,
      v.totalFuelConsumed,
      v.totalRevenue,
      v.totalOperationalCost,
      v.fuelEfficiency,
      (v.roi * 100).toFixed(2) + '%',
    ]);

    return [
      headers.join(','),
      ...rows.map((row: any) => row.join(',')),
    ].join('\r\n');
  }
}
