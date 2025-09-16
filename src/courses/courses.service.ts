
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
    try {
      console.log('[CoursesService:create] dto:', {
        ...createDto,
        description: (createDto as any)?.description?.slice?.(0, 120),
        whatYouWillLearn: (createDto as any)?.whatYouWillLearn?.slice?.(0, 120),
      });
      const existing = await this.courseModel.findOne({ title: createDto.title }).exec();
      if (existing) return null;

      let thumbnailUrl: string | undefined;
      if (thumbnail) {
        console.log('[CoursesService:create] uploading thumbnail...');
        const uploaded = await this.uploadService.uploadImage(thumbnail);
        thumbnailUrl = uploaded.secure_url;
        console.log('[CoursesService:create] uploaded thumbnail url:', thumbnailUrl);
      }

      const created = new this.courseModel({
        ...createDto,
        category: new Types.ObjectId(createDto.category),
        thumbnail: thumbnailUrl,
      });

      const saved = await created.save();
      console.log('[CoursesService:create] saved course id:', saved?._id?.toString());
      return saved;
    } catch (err) {
      console.error('[CoursesService:create] error:', err);
      throw err;
    }
  }

  async findAll(): Promise<Course[]> {
    return this.courseModel.find().populate('category').exec();
  }

  async findAllPaginated(page: number, limit: number): Promise<{ items: Course[]; total: number }> {
    const [items, total] = await Promise.all([
      this.courseModel
        .find()
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('category')
        .exec(),
      this.courseModel.countDocuments().exec(),
    ]);
    return { items, total };
  }

  async findOne(id: string): Promise<Course | null> {
    return this.courseModel.findById(id).populate('category').exec();
  }

  async update(
    id: string,
    updateDto: UpdateCourseDto,
    thumbnail?: Express.Multer.File,
  ): Promise<Course | null> {
    try {
      if (updateDto.title) {
        const existing = await this.courseModel.findOne({
          title: updateDto.title,
          _id: { $ne: new Types.ObjectId(id) },
        });
        if (existing) return null;
      }

      // Build a safe update object by excluding undefined/null/empty-string values
      const update: Record<string, unknown> = {};
      Object.entries(updateDto).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          !(typeof value === 'string' && value.trim() === '')
        ) {
          (update as any)[key] = value;
        }
      });
      console.log('[CoursesService:update] id:', id, 'processed update:', update);

      if (updateDto.category) {
        update.category = new Types.ObjectId(updateDto.category);
      }

      if (thumbnail) {
        console.log('[CoursesService:update] uploading thumbnail...');
        const uploaded = await this.uploadService.uploadImage(thumbnail);
        update.thumbnail = uploaded.secure_url;
        console.log('[CoursesService:update] uploaded thumbnail url:', update.thumbnail);
        // Optional: delete old Cloudinary image if you store its public_id
      }

      const updated = await this.courseModel
        .findByIdAndUpdate(id, update, { new: true })
        .populate('category')
        .exec();
      console.log('[CoursesService:update] updated course id:', updated?._id?.toString());
      return updated;
    } catch (err) {
      console.error('[CoursesService:update] error:', err);
      throw err;
    }
  }

  async remove(id: string) {
    return this.courseModel.findByIdAndDelete(id).exec();
  }

  async findByType(type: string): Promise<Course[]> {
    return this.courseModel.find({ type }).populate('category').exec();
  }
}