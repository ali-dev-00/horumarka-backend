import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContentManagementDocument = ContentManagement & Document;

@Schema({
  timestamps: true,
  collection: 'content-management',
})
export class ContentManagement {
  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  sectionName: string;

  @Prop({
    required: true,
    type: String,
  })
  sectionContent: string; // This will store JSON as string (LONGTEXT equivalent)
}

export const ContentManagementSchema = SchemaFactory.createForClass(ContentManagement);

// Add index for better query performance
ContentManagementSchema.index({ sectionName: 1 });
