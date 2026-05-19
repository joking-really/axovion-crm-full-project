import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactDocument = Contact & Document;

export enum ContactStatus {
  LEAD = 'lead',
  PROSPECT = 'prospect',
  CUSTOMER = 'customer',
  CHURNED = 'churned',
}

@Schema({ timestamps: true })
export class Contact {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  email: string;

  @Prop()
  phone: string;

  @Prop({ type: String, enum: Object.values(ContactStatus), default: ContactStatus.LEAD })
  status: ContactStatus;

  @Prop({ type: Object, default: {} })
  customFields: Record<string, any>;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  assignedTo: string;

  @Prop({ type: Date })
  lastContactedAt: Date;

  @Prop({ type: Object, default: {} })
  source: Record<string, any>;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
