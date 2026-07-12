import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DriverStatus, TripStatus, VehicleStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CompleteTripDto } from './dto/complete-trip.dto';
import { CreateTripDto } from './dto/create-trip.dto';

@Injectable()
export class TripsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private realtime: RealtimeGateway,
  ) {}

  async create(dto: CreateTripDto, actorId: string) {
    // Basic validation of existences
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: dto.vehicleId },
    });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${dto.vehicleId} not found`);
    }

    const driver = await this.prisma.driver.findUnique({
      where: { id: dto.driverId },
    });
    if (!driver) {
      throw new NotFoundException(`Driver with ID ${dto.driverId} not found`);
    }

    // Rule 5: Cargo Weight check
    if (dto.cargoWeightKg > Number(vehicle.maxLoadCapacityKg)) {
      throw new BadRequestException(
        `Cargo weight (${dto.cargoWeightKg} kg) exceeds vehicle maximum capacity (${vehicle.maxLoadCapacityKg} kg)`,
      );
    }

    // Rule 2: Vehicles with status RETIRED or IN_SHOP must never appear in dispatch selection pool
    if (vehicle.status === 'RETIRED' || vehicle.status === 'IN_SHOP') {
      throw new BadRequestException(
        `Vehicle is currently ${vehicle.status} and cannot be assigned to a trip`,
      );
    }

    // Rule 3: Expired or suspended driver check
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(driver.licenseExpiryDate);
    if (expiryDate < today) {
      throw new BadRequestException('Cannot assign driver: License has expired');
    }
    if (driver.status === 'SUSPENDED') {
      throw new BadRequestException('Cannot assign driver: Driver is SUSPENDED');
    }

    // Rule 4: Already ON_TRIP check
    if (vehicle.status === 'ON_TRIP') {
      throw new BadRequestException('Vehicle is already assigned to an active trip');
    }
    if (driver.status === 'ON_TRIP') {
      throw new BadRequestException('Driver is already assigned to an active trip');
    }

    const trip = await this.prisma.trip.create({
      data: {
        source: dto.source,
        destination: dto.destination,
        vehicleId: dto.vehicleId,
        driverId: dto.driverId,
        cargoWeightKg: dto.cargoWeightKg,
        plannedDistanceKm: dto.plannedDistanceKm,
        revenue: dto.revenue,
        status: TripStatus.DRAFT,
        createdBy: actorId,
      },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    await this.audit.log(actorId, 'TRIP_DRAFT_CREATED', 'Trip', trip.id, {
      source: trip.source,
      destination: trip.destination,
    });
    this.realtime.broadcast('kpi_update_trigger', {});
    return trip;
  }

  async findAll(query: { status?: TripStatus; driverId?: string; search?: string }) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.driverId) where.driverId = query.driverId;
    if (query.search) {
      where.OR = [
        { source: { contains: query.search, mode: 'insensitive' } },
        { destination: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.trip.findMany({
      where,
      include: {
        vehicle: true,
        driver: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        vehicle: true,
        driver: true,
      },
    });
    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }
    return trip;
  }

  async dispatch(id: string, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { id },
        include: { vehicle: true, driver: true },
      });
      if (!trip) {
        throw new NotFoundException(`Trip with ID ${id} not found`);
      }

      if (trip.status !== TripStatus.DRAFT) {
        throw new BadRequestException(`Only DRAFT trips can be dispatched. Current status: ${trip.status}`);
      }

      // Re-validate Rule 2: Vehicle retired/in-shop
      if (trip.vehicle.status === VehicleStatus.RETIRED || trip.vehicle.status === VehicleStatus.IN_SHOP) {
        throw new BadRequestException(
          `Cannot dispatch: Vehicle is currently ${trip.vehicle.status}`,
        );
      }

      // Re-validate Rule 3: Driver suspended/expired
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiry = new Date(trip.driver.licenseExpiryDate);
      if (expiry < today) {
        throw new BadRequestException('Cannot dispatch: Assigned driver license has expired');
      }
      if (trip.driver.status === DriverStatus.SUSPENDED) {
        throw new BadRequestException('Cannot dispatch: Assigned driver is SUSPENDED');
      }

      // Re-validate Rule 4: Vehicle/driver already ON_TRIP
      if (trip.vehicle.status === VehicleStatus.ON_TRIP) {
        throw new BadRequestException('Cannot dispatch: Vehicle is currently ON_TRIP');
      }
      if (trip.driver.status === DriverStatus.ON_TRIP) {
        throw new BadRequestException('Cannot dispatch: Driver is currently ON_TRIP');
      }

      // Rule 6: Dispatching a trip sets vehicle and driver status to ON_TRIP
      const updatedTrip = await tx.trip.update({
        where: { id },
        data: {
          status: TripStatus.DISPATCHED,
          dispatchedAt: new Date(),
        },
      });

      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: VehicleStatus.ON_TRIP },
      });

      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatus.ON_TRIP },
      });

      await this.audit.log(actorId, 'TRIP_DISPATCHED', 'Trip', trip.id, {
        vehicleId: trip.vehicleId,
        driverId: trip.driverId,
      });

      // Triggers realtime updates
      this.realtime.broadcast('trip_status_changed', { tripId: id, status: TripStatus.DISPATCHED });
      this.realtime.broadcast('vehicle_status_changed', { vehicleId: trip.vehicleId, status: VehicleStatus.ON_TRIP });
      this.realtime.broadcast('driver_status_changed', { driverId: trip.driverId, status: DriverStatus.ON_TRIP });
      this.realtime.broadcast('kpi_update_trigger', {});

      return updatedTrip;
    });
  }

  async complete(id: string, dto: CompleteTripDto, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { id },
        include: { vehicle: true, driver: true },
      });
      if (!trip) {
        throw new NotFoundException(`Trip with ID ${id} not found`);
      }

      if (trip.status !== TripStatus.DISPATCHED) {
        throw new BadRequestException(`Only DISPATCHED trips can be completed. Current status: ${trip.status}`);
      }

      // Rule 7: Completing a trip resets vehicle and driver status to AVAILABLE
      const updatedTrip = await tx.trip.update({
        where: { id },
        data: {
          status: TripStatus.COMPLETED,
          completedAt: new Date(),
          actualDistanceKm: dto.actualDistanceKm,
          fuelConsumedL: dto.fuelConsumedL,
        },
      });

      // Update vehicle odometer and restore status to AVAILABLE
      const newOdometer = Number(trip.vehicle.odometerKm) + dto.actualDistanceKm;
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: {
          status: VehicleStatus.AVAILABLE,
          odometerKm: newOdometer,
        },
      });

      // Restore driver status to AVAILABLE
      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatus.AVAILABLE },
      });

      // Automatically generate a FuelLog and a corresponding Expense for this trip
      // We will estimate the fuel cost at $1.45 per liter
      const fuelCost = dto.fuelConsumedL * 1.45;
      const fuelLogDate = new Date();

      await tx.fuelLog.create({
        data: {
          vehicleId: trip.vehicleId,
          tripId: trip.id,
          liters: dto.fuelConsumedL,
          cost: fuelCost,
          loggedDate: fuelLogDate,
          createdBy: actorId,
        },
      });

      await tx.expense.create({
        data: {
          vehicleId: trip.vehicleId,
          tripId: trip.id,
          category: 'FUEL',
          amount: fuelCost,
          description: `Auto-logged fuel expense for Completed Trip from ${trip.source} to ${trip.destination}`,
          incurredDate: fuelLogDate,
          createdBy: actorId,
        },
      });

      await this.audit.log(actorId, 'TRIP_COMPLETED', 'Trip', trip.id, {
        actualDistanceKm: dto.actualDistanceKm,
        fuelConsumedL: dto.fuelConsumedL,
        fuelCost,
      });

      // Broadcast changes
      this.realtime.broadcast('trip_status_changed', { tripId: id, status: TripStatus.COMPLETED });
      this.realtime.broadcast('vehicle_status_changed', { vehicleId: trip.vehicleId, status: VehicleStatus.AVAILABLE });
      this.realtime.broadcast('driver_status_changed', { driverId: trip.driverId, status: DriverStatus.AVAILABLE });
      this.realtime.broadcast('kpi_update_trigger', {});

      return updatedTrip;
    });
  }

  async cancel(id: string, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { id },
        include: { vehicle: true, driver: true },
      });
      if (!trip) {
        throw new NotFoundException(`Trip with ID ${id} not found`);
      }

      if (trip.status === TripStatus.COMPLETED || trip.status === TripStatus.CANCELLED) {
        throw new BadRequestException(`Cannot cancel a trip that is already ${trip.status}`);
      }

      // Rule 8: Cancelling a dispatched trip restores vehicle and driver to AVAILABLE
      const wasDispatched = trip.status === TripStatus.DISPATCHED;

      const updatedTrip = await tx.trip.update({
        where: { id },
        data: {
          status: TripStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      });

      if (wasDispatched) {
        await tx.vehicle.update({
          where: { id: trip.vehicleId },
          data: { status: VehicleStatus.AVAILABLE },
        });

        await tx.driver.update({
          where: { id: trip.driverId },
          data: { status: DriverStatus.AVAILABLE },
        });
      }

      await this.audit.log(actorId, 'TRIP_CANCELLED', 'Trip', trip.id, {
        wasDispatched,
      });

      // Broadcast changes
      this.realtime.broadcast('trip_status_changed', { tripId: id, status: TripStatus.CANCELLED });
      if (wasDispatched) {
        this.realtime.broadcast('vehicle_status_changed', { vehicleId: trip.vehicleId, status: VehicleStatus.AVAILABLE });
        this.realtime.broadcast('driver_status_changed', { driverId: trip.driverId, status: DriverStatus.AVAILABLE });
      }
      this.realtime.broadcast('kpi_update_trigger', {});

      return updatedTrip;
    });
  }
}
