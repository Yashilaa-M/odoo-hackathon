import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateFuelLogDto } from './dto/create-fuel-log.dto';

@Injectable()
export class FuelLogsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private realtime: RealtimeGateway,
  ) {}

  async create(dto: CreateFuelLogDto, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({
        where: { id: dto.vehicleId },
      });
      if (!vehicle) {
        throw new NotFoundException(`Vehicle with ID ${dto.vehicleId} not found`);
      }

      if (dto.tripId) {
        const trip = await tx.trip.findUnique({ where: { id: dto.tripId } });
        if (!trip) {
          throw new NotFoundException(`Trip with ID ${dto.tripId} not found`);
        }
      }

      const parsedDate = new Date(dto.loggedDate);

      // Create fuel log entry
      const log = await tx.fuelLog.create({
        data: {
          vehicleId: dto.vehicleId,
          tripId: dto.tripId || null,
          liters: dto.liters,
          cost: dto.cost,
          loggedDate: parsedDate,
          createdBy: actorId,
        },
      });

      // Synchronize into general expenses
      await tx.expense.create({
        data: {
          vehicleId: dto.vehicleId,
          tripId: dto.tripId || null,
          category: 'FUEL',
          amount: dto.cost,
          description: `Fuel purchase of ${dto.liters} liters`,
          incurredDate: parsedDate,
          createdBy: actorId,
        },
      });

      await this.audit.log(actorId, 'FUEL_LOGGED', 'FuelLog', log.id, {
        liters: dto.liters,
        cost: dto.cost,
      });

      this.realtime.broadcast('kpi_update_trigger', {});

      return log;
    });
  }

  async findAll(query: { vehicleId?: string }) {
    const where: any = {};
    if (query.vehicleId) where.vehicleId = query.vehicleId;

    return this.prisma.fuelLog.findMany({
      where,
      include: {
        vehicle: true,
        trip: true,
      },
      orderBy: { loggedDate: 'desc' },
    });
  }
}
