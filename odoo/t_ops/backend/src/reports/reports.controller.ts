import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { Response } from 'express';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Roles(RoleName.FINANCIAL_ANALYST, RoleName.FLEET_MANAGER)
  @Get()
  getReports() {
    return this.reportsService.getReports();
  }

  @Roles(RoleName.FINANCIAL_ANALYST, RoleName.FLEET_MANAGER)
  @Get('csv')
  async getReportsCSV(@Res() res: Response) {
    const reportData = await this.reportsService.getReports();
    const csv = this.reportsService.generateCSV(reportData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transitops_fleet_report.csv');
    return res.status(200).send(csv);
  }
}
