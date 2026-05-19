import { Controller, Get, Post, Put, Body, Param, Headers, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Roles } from '../auth';
import { BillingService } from './billing.service';
import { Subscription } from './schemas/subscription.schema';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Post()
  @Roles('super_admin')
  async create(@Body() body: Partial<Subscription>) {
    return this.billingService.create(body);
  }

  @Get(':tenantId')
  async findByTenant(@Param('tenantId') tenantId: string) {
    return this.billingService.findByTenant(tenantId);
  }

  @Put(':tenantId')
  @Roles('super_admin', 'tenant_admin')
  async update(
    @Param('tenantId') tenantId: string,
    @Body() body: Partial<Subscription>,
  ) {
    return this.billingService.update(tenantId, body);
  }

  @Post(':tenantId/credits')
  @Roles('super_admin')
  async addCredits(
    @Param('tenantId') tenantId: string,
    @Body() body: { amount: number },
  ) {
    return this.billingService.addCredits(tenantId, body.amount);
  }
}
