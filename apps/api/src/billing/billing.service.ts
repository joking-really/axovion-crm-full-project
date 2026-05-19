import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription, SubscriptionDocument, PlanType } from './schemas/subscription.schema';

@Injectable()
export class BillingService {
  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async create(data: Partial<Subscription>): Promise<Subscription> {
    const subscription = new this.subscriptionModel(data);
    return subscription.save();
  }

  async findByTenant(tenantId: string): Promise<Subscription> {
    return this.subscriptionModel.findOne({ tenantId }).exec();
  }

  async update(tenantId: string, data: Partial<Subscription>): Promise<Subscription> {
    return this.subscriptionModel
      .findOneAndUpdate({ tenantId }, data, { new: true })
      .exec();
  }

  async addCredits(tenantId: string, amount: number): Promise<Subscription> {
    return this.subscriptionModel
      .findOneAndUpdate(
        { tenantId },
        { $inc: { usageCredits: amount } },
        { new: true },
      )
      .exec();
  }

  async deductCredits(tenantId: string, amount: number): Promise<boolean> {
    const result = await this.subscriptionModel
      .findOneAndUpdate(
        { tenantId, usageCredits: { $gte: amount } },
        { $inc: { usageCredits: -amount, usedCredits: amount } },
        { new: true },
      )
      .exec();
    return !!result;
  }

  getPlanPrice(plan: PlanType): number {
    const prices = {
      [PlanType.STARTER]: 49,
      [PlanType.PROFESSIONAL]: 79,
      [PlanType.ENTERPRISE]: 149,
      [PlanType.CUSTOM]: 349,
    };
    return prices[plan] || 49;
  }
}
