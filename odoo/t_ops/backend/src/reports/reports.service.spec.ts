import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  it('aggregates vehicle and fleet metrics', async () => {
    const service = new ReportsService({
      vehicle: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'veh-1',
            registrationNumber: 'TX-TRK-01',
            nameModel: 'Freightliner Cascadia',
            type: 'TRUCK',
            acquisitionCost: 1000,
            trips: [
              { actualDistanceKm: 200, fuelConsumedL: 20, revenue: 700 },
              { actualDistanceKm: 100, fuelConsumedL: 10, revenue: 300 },
            ],
            fuelLogs: [{ cost: 80 }],
            maintenanceLogs: [{ cost: 40 }],
            expenses: [{ amount: 120 }, { amount: 40 }],
          },
        ]),
      },
    } as any);

    await expect(service.getReports()).resolves.toEqual({
      fleet: {
        totalDistance: 300,
        totalFuel: 30,
        fuelEfficiency: 10,
      },
      vehicles: [
        {
          id: 'veh-1',
          registrationNumber: 'TX-TRK-01',
          nameModel: 'Freightliner Cascadia',
          type: 'TRUCK',
          acquisitionCost: 1000,
          totalDistance: 300,
          totalFuelConsumed: 30,
          totalRevenue: 1000,
          fuelCost: 80,
          maintenanceCost: 40,
          totalOperationalCost: 160,
          fuelEfficiency: 10,
          roi: 0.84,
        },
      ],
    });
  });

  it('generates CSV rows from report data', () => {
    const service = new ReportsService({} as any);

    const csv = service.generateCSV({
      vehicles: [
        {
          registrationNumber: 'TX-TRK-01',
          nameModel: 'Freightliner Cascadia',
          type: 'TRUCK',
          acquisitionCost: 1000,
          totalDistance: 300,
          totalFuelConsumed: 30,
          totalRevenue: 1000,
          totalOperationalCost: 160,
          fuelEfficiency: 10,
          roi: 0.84,
        },
      ],
    });

    expect(csv).toContain('Registration Number,Name/Model,Type');
    expect(csv).toContain('TX-TRK-01,"Freightliner Cascadia",TRUCK,1000,300,30,1000,160,10,84.00%');
  });
});
