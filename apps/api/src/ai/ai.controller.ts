import { Controller, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth';
import { AiService } from './ai.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('chat')
  async chat(
    @Body() body: { conversationId: string; message: string },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    const response = await this.aiService.generateResponse(
      body.conversationId,
      tenantId,
      body.message,
    );
    return { response };
  }

  @Post('sentiment')
  async sentiment(@Body() body: { text: string }) {
    const sentiment = await this.aiService.analyzeSentiment(body.text);
    return { sentiment };
  }
}
