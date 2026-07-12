import { ExpenseCategory } from '../prisma-enums';
import { Injectable, NotFoundException } from '@nestjs/common';
;
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private realtime: RealtimeGateway,
  ) {}

  async create(dto: CreateExpenseDto, actorId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: dto.vehicleId },
    });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${dto.vehicleId} not found`);
    }

    if (dto.tripId) {
      const trip = await this.prisma.trip.findUnique({
        where: { id: dto.tripId },
      });
      if (!trip) {
        throw new NotFoundException(`Trip with ID ${dto.tripId} not found`);
      }
    }

    const expense = await this.prisma.expense.create({
      data: {
        vehicleId: dto.vehicleId,
        tripId: dto.tripId || null,
        category: dto.category,
        amount: dto.amount,
        description: dto.description,
        incurredDate: new Date(dto.incurredDate),
        createdBy: actorId,
      },
    });

    await this.audit.log(actorId, 'EXPENSE_LOGGED', 'Expense', expense.id, {
      category: dto.category,
      amount: dto.amount,
    });

    this.realtime.broadcast('kpi_update_trigger', {});

    return expense;
  }

  async findAll(query: { vehicleId?: string; category?: ExpenseCategory }) {
    const where: any = {};
    if (query.vehicleId) where.vehicleId = query.vehicleId;
    if (query.category) where.category = query.category;

    return this.prisma.expense.findMany({
      where,
      include: {
        vehicle: true,
        trip: true,
      },
      orderBy: { incurredDate: 'desc' },
    });
  }
}
