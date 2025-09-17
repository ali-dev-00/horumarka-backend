import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BlogDocument = Blog & Document;

export enum BlogStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })
export class Blog {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ required: true })
  featuredImage: string;

  @Prop({ type: String, enum: BlogStatus, required: true })
  status: BlogStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  postedBy: Types.ObjectId | null;

  @Prop({ type: Date, default: () => new Date() })
  postedOn: Date;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.index({ slug: 1 }, { unique: true });
