import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private realtime: RealtimeGateway,
  ) {}

  async create(dto: CreateVehicleDto, actorId: string) {
    const existing = await this.prisma.vehicle.findUnique({
      where: { registrationNumber: dto.registrationNumber },
    });
    if (existing) {
      throw new ConflictException(
        `Vehicle registration number '${dto.registrationNumber}' is already registered`,
      );
    }

    const vehicle = await this.prisma.vehicle.create({
      data: {
        registrationNumber: dto.registrationNumber,
        nameModel: dto.nameModel,
        type: dto.type,
        maxLoadCapacityKg: dto.maxLoadCapacityKg,
        odometerKm: dto.odometerKm || 0,
        acquisitionCost: dto.acquisitionCost,
        region: dto.region,
        status: dto.status || 'AVAILABLE',
      },
    });

    await this.audit.log(actorId, 'VEHICLE_CREATED', 'Vehicle', vehicle.id, {
      registrationNumber: vehicle.registrationNumber,
    });
    this.realtime.broadcast('kpi_update_trigger', {});
    return vehicle;
  }

  async findAll(query: { type?: string; status?: string; region?: string; search?: string }) {
    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.region) {
      where.region = { contains: query.region, mode: 'insensitive' };
    }
    if (query.search) {
      where.OR = [
        { nameModel: { contains: query.search, mode: 'insensitive' } },
        { registrationNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        maintenanceLogs: { orderBy: { openedAt: 'desc' }, take: 5 },
        trips: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }
    return vehicle;
  }

  async update(id: string, dto: UpdateVehicleDto, actorId: string) {
    const vehicle = await this.findOne(id);

    if (dto.registrationNumber && dto.registrationNumber !== vehicle.registrationNumber) {
      const existing = await this.prisma.vehicle.findUnique({
        where: { registrationNumber: dto.registrationNumber },
      });
      if (existing) {
        throw new ConflictException(
          `Vehicle registration number '${dto.registrationNumber}' is already registered`,
        );
      }
    }

    const updated = await this.prisma.vehicle.update({
      where: { id },
      data: dto,
    });

    await this.audit.log(actorId, 'VEHICLE_UPDATED', 'Vehicle', updated.id, dto);

    if (dto.status && dto.status !== vehicle.status) {
      this.realtime.broadcast('vehicle_status_changed', { vehicleId: id, status: dto.status });
      this.realtime.broadcast('kpi_update_trigger', {});
    }

    return updated;
  }

  async remove(id: string, actorId: string) {
    const vehicle = await this.findOne(id);

    const activeTrips = await this.prisma.trip.count({
      where: { vehicleId: id, status: 'DISPATCHED' },
    });
    if (activeTrips > 0) {
      throw new ConflictException('Cannot delete a vehicle while it is assigned to an active trip');
    }

    const totalTrips = await this.prisma.trip.count({
      where: { vehicleId: id },
    });
    const totalLogs = await this.prisma.maintenanceLog.count({
      where: { vehicleId: id },
    });

    if (totalTrips > 0 || totalLogs > 0) {
      const updated = await this.prisma.vehicle.update({
        where: { id },
        data: { status: 'RETIRED' },
      });
      await this.audit.log(actorId, 'VEHICLE_RETIRED', 'Vehicle', id, {
        reason: 'Archived to RETIRED to preserve financial history',
      });
      this.realtime.broadcast('vehicle_status_changed', { vehicleId: id, status: 'RETIRED' });
      this.realtime.broadcast('kpi_update_trigger', {});
      return {
        success: true,
        message: 'Vehicle has active logs or trips; archived to RETIRED status',
        vehicle: updated,
      };
    }

    await this.prisma.vehicle.delete({ where: { id } });
    await this.audit.log(actorId, 'VEHICLE_DELETED', 'Vehicle', id, {
      registrationNumber: vehicle.registrationNumber,
    });
    this.realtime.broadcast('kpi_update_trigger', {});
    return { success: true, message: 'Vehicle deleted successfully from registry' };
  }
}
