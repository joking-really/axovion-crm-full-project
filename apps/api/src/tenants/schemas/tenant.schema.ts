import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TenantDocument = Tenant & Document;

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true, unique: true })
  subdomain: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ default: 'starter' })
  plan: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  databaseName: string;

  @Prop({ type: Object, default: {} })
  settings: Record<string, any>;

  @Prop({ type: [String], default: [] })
  allowedOrigins: string[];
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
