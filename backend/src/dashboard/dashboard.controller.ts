import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  getKpis(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('region') region?: string,
  ) {
    return this.dashboardService.getKpis({ type, status, region });
  }
}
