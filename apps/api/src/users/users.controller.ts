import { Controller, Get, Post, Put, Delete, Body, Param, Headers, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Roles, CurrentUser } from '../auth';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Roles('tenant_admin', 'super_admin')
  async create(
    @Body() body: Partial<User>,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.usersService.create({ ...body, tenantId });
  }

  @Get()
  async findAll(@Headers('x-tenant-id') tenantId: string) {
    return this.usersService.findAll(tenantId);
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.usersService.findById(id, tenantId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<User>,
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: any,
  ) {
    if (user.role === 'agent' && user.userId !== id) {
      throw new Error('Can only update own profile');
    }
    return this.usersService.update(id, tenantId, body);
  }

  @Delete(':id')
  @Roles('tenant_admin', 'super_admin')
  async delete(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.usersService.delete(id, tenantId);
  }
}
