import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private realtime: RealtimeGateway,
  ) {}

  async create(dto: CreateDriverDto, actorId: string) {
    const existing = await this.prisma.driver.findUnique({
      where: { licenseNumber: dto.licenseNumber },
    });
    if (existing) {
      throw new ConflictException(
        `Driver license number '${dto.licenseNumber}' is already registered`,
      );
    }

    const driver = await this.prisma.driver.create({
      data: {
        userId: dto.userId || null,
        fullName: dto.fullName,
        licenseNumber: dto.licenseNumber,
        licenseCategory: dto.licenseCategory,
        licenseExpiryDate: new Date(dto.licenseExpiryDate),
        contactNumber: dto.contactNumber,
        safetyScore: dto.safetyScore ?? 100,
        status: dto.status || 'AVAILABLE',
      },
    });

    await this.audit.log(actorId, 'DRIVER_CREATED', 'Driver', driver.id, {
      licenseNumber: driver.licenseNumber,
    });
    this.realtime.broadcast('kpi_update_trigger', {});
    return driver;
  }

  async findAll(query: { status?: string; search?: string }) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { licenseNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.driver.findMany({
      where,
      include: { user: { select: { email: true, id: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, id: true } },
        trips: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }
    return driver;
  }

  async update(id: string, dto: UpdateDriverDto, actorId: string) {
    const driver = await this.findOne(id);

    if (dto.licenseNumber && dto.licenseNumber !== driver.licenseNumber) {
      const existing = await this.prisma.driver.findUnique({
        where: { licenseNumber: dto.licenseNumber },
      });
      if (existing) {
        throw new ConflictException(
          `Driver license number '${dto.licenseNumber}' is already registered`,
        );
      }
    }

    const updateData: any = { ...dto };
    if (dto.licenseExpiryDate) {
      updateData.licenseExpiryDate = new Date(dto.licenseExpiryDate);
    }

    const updated = await this.prisma.driver.update({
      where: { id },
      data: updateData,
    });

    await this.audit.log(actorId, 'DRIVER_UPDATED', 'Driver', updated.id, dto);

    if (dto.status && dto.status !== driver.status) {
      this.realtime.broadcast('driver_status_changed', { driverId: id, status: dto.status });
      this.realtime.broadcast('kpi_update_trigger', {});
    }

    return updated;
  }

  async remove(id: string, actorId: string) {
    const driver = await this.findOne(id);

    const activeTrips = await this.prisma.trip.count({
      where: { driverId: id, status: 'DISPATCHED' },
    });
    if (activeTrips > 0) {
      throw new ConflictException('Cannot delete driver while they are assigned to an active trip');
    }

    const totalTrips = await this.prisma.trip.count({
      where: { driverId: id },
    });

    if (totalTrips > 0) {
      const updated = await this.prisma.driver.update({
        where: { id },
        data: { status: 'SUSPENDED' },
      });
      await this.audit.log(actorId, 'DRIVER_SUSPENDED', 'Driver', id, {
        reason: 'Archived to SUSPENDED status to retain driver safety logs',
      });
      this.realtime.broadcast('driver_status_changed', { driverId: id, status: 'SUSPENDED' });
      this.realtime.broadcast('kpi_update_trigger', {});
      return {
        success: true,
        message: 'Driver has trip history; archived to SUSPENDED status',
        driver: updated,
      };
    }

    await this.prisma.driver.delete({ where: { id } });
    await this.audit.log(actorId, 'DRIVER_DELETED', 'Driver', id, {
      licenseNumber: driver.licenseNumber,
    });
    this.realtime.broadcast('kpi_update_trigger', {});
    return { success: true, message: 'Driver deleted successfully from registry' };
  }
}
