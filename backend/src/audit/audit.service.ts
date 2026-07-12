import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(actorId: string | null, action: string, entityType: string, entityId: string, metadata?: any) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          actorId,
          action,
          entityType,
          entityId,
          metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
        },
      });
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }
}
