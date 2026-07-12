import { VehicleStatus, MaintenanceStatus } from '../prisma-enums';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
;
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CloseMaintenanceDto } from './dto/close-maintenance.dto';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private realtime: RealtimeGateway,
  ) {}

  async create(dto: CreateMaintenanceDto, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({
        where: { id: dto.vehicleId },
      });
      if (!vehicle) {
        throw new NotFoundException(`Vehicle with ID ${dto.vehicleId} not found`);
      }

      // Rule 2: Cannot select retired vehicles
      if (vehicle.status === VehicleStatus.RETIRED) {
        throw new BadRequestException('Cannot put a retired vehicle into maintenance');
      }

      // Rule: Cannot put vehicle in maintenance if it is currently ON_TRIP
      if (vehicle.status === VehicleStatus.ON_TRIP) {
        throw new BadRequestException(
          'Cannot put vehicle into maintenance while it is currently ON_TRIP',
        );
      }

      const log = await tx.maintenanceLog.create({
        data: {
          vehicleId: dto.vehicleId,
          type: dto.type,
          description: dto.description,
          cost: dto.cost,
          status: MaintenanceStatus.ACTIVE,
          createdBy: actorId,
        },
      });

      // Rule 9: Creating active maintenance log sets vehicle status to IN_SHOP
      await tx.vehicle.update({
        where: { id: dto.vehicleId },
        data: { status: VehicleStatus.IN_SHOP },
      });

      await this.audit.log(actorId, 'MAINTENANCE_OPENED', 'MaintenanceLog', log.id, {
        vehicleId: dto.vehicleId,
        type: dto.type,
      });

      // Broadcast changes in real time
      this.realtime.broadcast('vehicle_status_changed', {
        vehicleId: dto.vehicleId,
        status: VehicleStatus.IN_SHOP,
      });
      this.realtime.broadcast('kpi_update_trigger', {});

      return log;
    });
  }

  async findAll(query: { vehicleId?: string; status?: MaintenanceStatus }) {
    const where: any = {};
    if (query.vehicleId) where.vehicleId = query.vehicleId;
    if (query.status) where.status = query.status;

    return this.prisma.maintenanceLog.findMany({
      where,
      include: {
        vehicle: true,
      },
      orderBy: { openedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const log = await this.prisma.maintenanceLog.findUnique({
      where: { id },
      include: {
        vehicle: true,
      },
    });
    if (!log) {
      throw new NotFoundException(`Maintenance log with ID ${id} not found`);
    }
    return log;
  }

  async close(id: string, dto: CloseMaintenanceDto, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const log = await tx.maintenanceLog.findUnique({
        where: { id },
        include: { vehicle: true },
      });
      if (!log) {
        throw new NotFoundException(`Maintenance log with ID ${id} not found`);
      }

      if (log.status !== MaintenanceStatus.ACTIVE) {
        throw new BadRequestException(
          `Maintenance log is already ${log.status} and cannot be closed`,
        );
      }

      const closedLog = await tx.maintenanceLog.update({
        where: { id },
        data: {
          status: MaintenanceStatus.CLOSED,
          closedAt: new Date(),
          cost: dto.cost,
        },
      });

      // Rule 10: Closing maintenance log restores status to AVAILABLE, unless status is RETIRED
      let newVehicleStatus: VehicleStatus = VehicleStatus.AVAILABLE;
      if (log.vehicle.status === VehicleStatus.RETIRED) {
        newVehicleStatus = VehicleStatus.RETIRED;
      }

      await tx.vehicle.update({
        where: { id: log.vehicleId },
        data: { status: newVehicleStatus },
      });

      // Automatically register a Maintenance Expense for tracking total cost calculations
      await tx.expense.create({
        data: {
          vehicleId: log.vehicleId,
          tripId: null,
          category: 'MAINTENANCE',
          amount: dto.cost,
          description: `Maintenance Log Closed (${log.type}) - ${log.description || ''}`,
          incurredDate: new Date(),
          createdBy: actorId,
        },
      });

      await this.audit.log(actorId, 'MAINTENANCE_CLOSED', 'MaintenanceLog', log.id, {
        finalCost: dto.cost,
        vehicleId: log.vehicleId,
      });

      // Broadcast changes in real time
      this.realtime.broadcast('vehicle_status_changed', {
        vehicleId: log.vehicleId,
        status: newVehicleStatus,
      });
      this.realtime.broadcast('kpi_update_trigger', {});

      return closedLog;
    });
  }
}
