import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectQueue('notifications') private notificationsQueue: Queue,
  ) {}

  async sendEmail(data: {
    to: string;
    subject: string;
    body: string;
    tenantId: string;
  }): Promise<void> {
    await this.notificationsQueue.add('email', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }

  async sendBulkEmail(data: {
    recipients: string[];
    subject: string;
    body: string;
    tenantId: string;
  }): Promise<void> {
    await this.notificationsQueue.add('bulk-email', data, {
      attempts: 2,
      backoff: { type: 'fixed', delay: 10000 },
    });
  }

  async scheduleReminder(data: {
    to: string;
    subject: string;
    body: string;
    scheduledAt: Date;
    tenantId: string;
  }): Promise<void> {
    const delay = data.scheduledAt.getTime() - Date.now();
    await this.notificationsQueue.add('reminder', data, {
      delay: Math.max(delay, 0),
      attempts: 3,
    });
  }
}
