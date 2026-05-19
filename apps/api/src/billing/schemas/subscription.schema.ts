import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubscriptionDocument = Subscription & Document;

export enum PlanType {
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  CUSTOM = 'custom',
}

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ type: String, enum: Object.values(PlanType), required: true })
  plan: PlanType;

  @Prop({ default: 0 })
  usageCredits: number;

  @Prop({ default: 0 })
  usedCredits: number;

  @Prop()
  stripeCustomerId: string;

  @Prop()
  stripeSubscriptionId: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  currentPeriodStart: Date;

  @Prop()
  currentPeriodEnd: Date;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
