import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth';
import { ContactsService } from './contacts.service';
import { Contact } from './schemas/contact.schema';

@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(private contactsService: ContactsService) {}

  @Post()
  async create(
    @Body() body: Partial<Contact>,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.contactsService.create({ ...body, tenantId });
  }

  @Get()
  async findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: any,
  ) {
    return this.contactsService.findAll(tenantId, query);
  }

  @Get('search')
  async search(
    @Headers('x-tenant-id') tenantId: string,
    @Query('q') searchTerm: string,
  ) {
    return this.contactsService.search(tenantId, searchTerm);
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.contactsService.findById(id, tenantId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<Contact>,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.contactsService.update(id, tenantId, body);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.contactsService.delete(id, tenantId);
  }
}