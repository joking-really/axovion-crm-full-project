import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Analytics, AnalyticsDocument } from './schemas/analytics.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Analytics.name)
    private analyticsModel: Model<AnalyticsDocument>,
  ) {}

  async trackEvent(data: Partial<Analytics>): Promise<Analytics> {
    const event = new this.analyticsModel(data);
    return event.save();
  }

  async getDashboardStats(tenantId: string): Promise<any> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalConversations,
      totalContacts,
      aiInteractions,
      avgResponseTime,
    ] = await Promise.all([
      this.analyticsModel.countDocuments({
        tenantId,
        eventType: 'conversation_started',
        createdAt: { $gte: thirtyDaysAgo },
      }),
      this.analyticsModel.countDocuments({
        tenantId,
        eventType: 'contact_created',
        createdAt: { $gte: thirtyDaysAgo },
      }),
      this.analyticsModel.countDocuments({
        tenantId,
        eventType: 'ai_response',
        createdAt: { $gte: thirtyDaysAgo },
      }),
      this.analyticsModel
        .aggregate([
          {
            $match: {
              tenantId,
              eventType: 'response_time',
              createdAt: { $gte: thirtyDaysAgo },
            },
          },
          { $group: { _id: null, avg: { $avg: '$metadata.duration' } } },
        ])
        .exec(),
    ]);

    return {
      totalConversations,
      totalContacts,
      aiInteractions,
      avgResponseTime: avgResponseTime[0]?.avg || 0,
      period: '30d',
    };
  }

  async getConversationMetrics(tenantId: string): Promise<any[]> {
    return this.analyticsModel
      .aggregate([
        {
          $match: {
            tenantId,
            eventType: 'conversation_started',
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .exec();
  }
}
