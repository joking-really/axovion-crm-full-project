import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Roles } from '../auth';
import { TenantsService } from './tenants.service';
import { Tenant } from './schemas/tenant.schema';

@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Post()
  @Roles('super_admin')
  async create(@Body() body: Partial<Tenant>) {
    return this.tenantsService.create(body);
  }

  @Get()
  @Roles('super_admin')
  async findAll() {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.tenantsService.findById(id);
  }

  @Put(':id')
  @Roles('super_admin', 'tenant_admin')
  async update(@Param('id') id: string, @Body() body: Partial<Tenant>) {
    return this.tenantsService.update(id, body);
  }

  @Delete(':id')
  @Roles('super_admin')
  async delete(@Param('id') id: string) {
    return this.tenantsService.delete(id);
  }
}
