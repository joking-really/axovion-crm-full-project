import { Controller, Get, Post, Put, Body, Param, Query, Headers, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth';
import { ConversationsService } from './conversations.service';
import { Conversation } from './schemas/conversation.schema';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Post()
  async create(
    @Body() body: Partial<Conversation>,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.conversationsService.create({ ...body, tenantId });
  }

  @Get()
  async findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: any,
  ) {
    return this.conversationsService.findAll(tenantId, query);
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.conversationsService.findById(id, tenantId);
  }

  @Post(':id/messages')
  async addMessage(
    @Param('id') id: string,
    @Body() body: { content: string; sender: string; metadata?: any },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.conversationsService.addMessage(id, tenantId, {
      ...body,
      timestamp: new Date(),
    });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<Conversation>,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.conversationsService.update(id, tenantId, body);
  }
}