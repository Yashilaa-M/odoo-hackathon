import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  it('calculates KPI totals and utilization', async () => {
    const count = jest
      .fn()
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(6)
      .mockResolvedValueOnce(7);

    const service = new DashboardService({
      vehicle: { count },
      trip: { count },
      driver: { count },
    } as any);

    await expect(service.getKpis()).resolves.toEqual({
      activeVehicles: 3,
      availableVehicles: 5,
      inShopVehicles: 2,
      activeTrips: 4,
      pendingTrips: 6,
      driversOnDuty: 7,
      fleetUtilization: 30,
    });
  });

  it('returns zero utilization when there are no non-retired vehicles', async () => {
    const count = jest
      .fn()
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);

    const service = new DashboardService({
      vehicle: { count },
      trip: { count },
      driver: { count },
    } as any);

    await expect(service.getKpis()).resolves.toMatchObject({
      fleetUtilization: 0,
    });
  });
});
