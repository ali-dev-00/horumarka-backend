import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from '../schemas/course.schema';
import { CreateCourseDto, UpdateCourseDto } from './course.dto';
import { UploadService } from '../cloudinary/upload.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    private readonly uploadService: UploadService,
  ) {}

  async create(
    createDto: CreateCourseDto,
    thumbnail?: Express.Multer.File,
  ): Promise<Course | null> {
    const existing = await this.courseModel.findOne({ title: createDto.title }).exec();
    if (existing) return null;

    let thumbnailUrl: string | undefined;
    if (thumbnail) {
      const uploaded = await this.uploadService.uploadImage(thumbnail);
      thumbnailUrl = uploaded.secure_url;
    }

    const created = new this.courseModel({
      ...createDto,
      category: new Types.ObjectId(createDto.category),
      thumbnail: thumbnailUrl,
    });

    return created.save();
  }

  async findAll(): Promise<Course[]> {
    return this.courseModel.find().populate('category').exec();
  }

  async findAllPaginated(page: number, limit: number): Promise<Course[]> {
    return this.courseModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('category')
      .exec();
  }

  async findOne(id: string): Promise<Course | null> {
    return this.courseModel.findById(id).populate('category').exec();
  }

  async update(
    id: string,
    updateDto: UpdateCourseDto,
    thumbnail?: Express.Multer.File,
  ): Promise<Course | null> {
    if (updateDto.title) {
      const existing = await this.courseModel.findOne({
        title: updateDto.title,
        _id: { $ne: id },
      });
      if (existing) return null;
    }

    const update: any = { ...updateDto };

    if (updateDto.category) {
      update.category = new Types.ObjectId(updateDto.category);
    }

    if (thumbnail) {
      const uploaded = await this.uploadService.uploadImage(thumbnail);
      update.thumbnail = uploaded.secure_url;
      // Optional: delete old Cloudinary image if you store its public_id
    }

    return this.courseModel
      .findByIdAndUpdate(id, update, { new: true })
      .populate('category')
      .exec();
  }

  async remove(id: string) {
    return this.courseModel.findByIdAndDelete(id).exec();
  }
}