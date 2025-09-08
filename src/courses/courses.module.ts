import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course, CourseSchema } from '../schemas/course.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
    CloudinaryModule,
    MulterModule.register({ storage: memoryStorage() }),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}