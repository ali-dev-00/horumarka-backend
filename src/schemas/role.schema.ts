import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Permission } from '../config/permissions';

export type RoleDocument = Role & Document;

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: [String], enum: Permission, default: [] })
  permissions: Permission[];

  @Prop({ default: true })
  status: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
