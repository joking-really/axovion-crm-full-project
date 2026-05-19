import { Processor, Process } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Processor('notifications')
export class EmailProcessor {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
  }

  @Process('email')
  async handleEmail(job: Job) {
    const { to, subject, body } = job.data;
    await this.resend.emails.send({
      from: this.configService.get('RESEND_FROM_EMAIL'),
      to,
      subject,
      html: body,
    });
  }

  @Process('bulk-email')
  async handleBulkEmail(job: Job) {
    const { recipients, subject, body } = job.data;
    for (const to of recipients) {
      await this.resend.emails.send({
        from: this.configService.get('RESEND_FROM_EMAIL'),
        to,
        subject,
        html: body,
      });
    }
  }

  @Process('reminder')
  async handleReminder(job: Job) {
    const { to, subject, body } = job.data;
    await this.resend.emails.send({
      from: this.configService.get('RESEND_FROM_EMAIL'),
      to,
      subject,
      html: body,
    });
  }
}
