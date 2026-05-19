import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AnalyticsDocument = Analytics & Document;

@Schema({ timestamps: true })
export class Analytics {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  eventType: string;

  @Prop()
  userId: string;

  @Prop()
  contactId: string;

  @Prop()
  conversationId: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop()
  sessionId: string;

  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;
}

export const AnalyticsSchema = SchemaFactory.createForClass(Analytics);
