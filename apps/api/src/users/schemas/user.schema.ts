import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  TENANT_ADMIN = 'tenant_admin',
  AGENT = 'agent',
  VIEWER = 'viewer',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  tenantId: string;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.AGENT,
  })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object, default: {} })
  preferences: Record<string, any>;

  @Prop()
  lastLoginAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
