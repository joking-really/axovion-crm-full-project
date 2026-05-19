import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConversationDocument = Conversation & Document;

export enum ConversationChannel {
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
  VOICE = 'voice',
  SMS = 'sms',
  WEB = 'web',
}

export enum ConversationStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
}

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true })
  content: string;

  @Prop({ type: String, enum: ['user', 'ai', 'agent'], required: true })
  sender: string;

  @Prop()
  agentId: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ default: Date.now })
  timestamp: Date;
}

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  contactId: string;

  @Prop({ type: String, enum: Object.values(ConversationChannel), required: true })
  channel: ConversationChannel;

  @Prop({ type: String, enum: Object.values(ConversationStatus), default: ConversationStatus.ACTIVE })
  status: ConversationStatus;

  @Prop({ type: [Message], default: [] })
  messages: Message[];

  @Prop()
  assignedTo: string;

  @Prop({ type: Object, default: {} })
  aiContext: Record<string, any>;

  @Prop()
  resolvedAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
