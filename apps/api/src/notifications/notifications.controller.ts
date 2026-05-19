import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post('email')
  async sendEmail(
    @Body() body: { to: string; subject: string; body: string; tenantId: string },
  ) {
    await this.notificationsService.sendEmail(body);
    return { message: 'Email queued' };
  }

  @Post('bulk-email')
  async sendBulkEmail(
    @Body() body: { recipients: string[]; subject: string; body: string; tenantId: string },
  ) {
    await this.notificationsService.sendBulkEmail(body);
    return { message: 'Bulk email queued' };
  }

  @Post('reminder')
  async scheduleReminder(
    @Body() body: { to: string; subject: string; body: string; scheduledAt: string; tenantId: string },
  ) {
    await this.notificationsService.scheduleReminder({
      ...body,
      scheduledAt: new Date(body.scheduledAt),
    });
    return { message: 'Reminder scheduled' };
  }
}
