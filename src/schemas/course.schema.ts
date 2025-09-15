
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ModeOfStudy, CourseType } from '../courses/course.dto';

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ type: String, required: true, trim: true })
  description: string;

  @Prop()
  thumbnail?: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  whatYouWillLearn: string;

  @Prop({ type: String, required: true, trim: true })
  location: string;

  @Prop({ required: true, enum: ModeOfStudy })
  modeOfStudy: ModeOfStudy;

  @Prop({ required: true, default: true })
  status: boolean;

  @Prop({ required: true })
  noOfVacancies: number;

  @Prop({ required: true, enum: CourseType })
  type: CourseType;
}

export type CourseDocument = Course & Document;
export const CourseSchema = SchemaFactory.createForClass(Course);