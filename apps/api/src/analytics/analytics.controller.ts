import { Controller, Get, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth';
import { AnalyticsService } from './analytics.service';
import { Analytics } from './schemas/analytics.schema';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('track')
  async trackEvent(
    @Body() body: Partial<Analytics>,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.analyticsService.trackEvent({ ...body, tenantId });
  }

  @Get('dashboard')
  async getDashboardStats(@Headers('x-tenant-id') tenantId: string) {
    return this.analyticsService.getDashboardStats(tenantId);
  }

  @Get('conversations')
  async getConversationMetrics(@Headers('x-tenant-id') tenantId: string) {
    return this.analyticsService.getConversationMetrics(tenantId);
  }
}
