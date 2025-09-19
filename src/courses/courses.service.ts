
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

      // Validate sale logic
      if (createDto.isOnSale && (createDto.salePrice === undefined || createDto.salePrice === null)) {
        throw new Error('salePrice is required when isOnSale is true');
      }
      if (createDto.isOnSale && createDto.salePrice! >= createDto.price) {
        throw new Error('salePrice must be less than price');
      }
      if (!createDto.isOnSale) {
        (createDto as any).salePrice = null;
      }

      const created = new this.courseModel({
        ...createDto,
        category: new Types.ObjectId(createDto.category),
        thumbnail: thumbnailUrl,
      });

      const saved = await created.save();
      console.log('[CoursesService:create] saved course id:', saved?._id?.toString());
      const obj: any = saved.toObject();
      obj.effectivePrice = obj.isOnSale && obj.salePrice != null ? obj.salePrice : obj.price;
      return obj;
    } catch (err) {
      console.error('[CoursesService:create] error:', err);
      throw err;
    }
  }

  async findAll(): Promise<Course[]> {
    const docs = await this.courseModel.find().populate('category').exec();
    return docs.map(d => { const o: any = d.toObject(); o.effectivePrice = o.isOnSale && o.salePrice != null ? o.salePrice : o.price; return o; });
  }

  // Overloads allow calling with (page, limit) or (page, limit, filter)
  async findAllPaginated(page: number, limit: number): Promise<{ items: Course[]; total: number }>;
  async findAllPaginated(page: number, limit: number, filter: Record<string, any>): Promise<{ items: Course[]; total: number }>;
  async findAllPaginated(page: number, limit: number, filter: Record<string, any> = {}): Promise<{ items: Course[]; total: number }> {
    const mongoFilter: Record<string, any> = { ...filter };
    const [docs, total] = await Promise.all([
      this.courseModel
        .find(mongoFilter)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('category')
        .exec(),
      this.courseModel.countDocuments(mongoFilter).exec(),
    ]);
    const items = docs.map(d => { const o: any = d.toObject(); o.effectivePrice = o.isOnSale && o.salePrice != null ? o.salePrice : o.price; return o; });
    return { items: items as any, total };
  }

  async findOne(id: string): Promise<Course | null> {
    const doc = await this.courseModel.findById(id).populate('category').exec();
    if (!doc) return null;
    const o: any = doc.toObject();
    o.effectivePrice = o.isOnSale && o.salePrice != null ? o.salePrice : o.price;
    return o;
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

      // Pricing / sale logic adjustments
      if ('isOnSale' in update || 'salePrice' in update || 'price' in update) {
        const current = await this.courseModel.findById(id).lean();
        if (!current) return null;
        const price = (update.price as number) ?? current.price;
        const isOnSale = (update.isOnSale as boolean) ?? current.isOnSale;
        const salePrice = (update.salePrice as number | null | undefined) ?? current.salePrice ?? null;
        if (isOnSale) {
          if (salePrice == null) throw new Error('salePrice is required when isOnSale is true');
          if (salePrice >= price) throw new Error('salePrice must be less than price');
          update.salePrice = salePrice;
        } else {
          update.salePrice = null;
        }
      }

      const updatedDoc = await this.courseModel
        .findByIdAndUpdate(id, update, { new: true })
        .populate('category')
        .exec();
      const updated = updatedDoc ? ((): any => { const o: any = updatedDoc.toObject(); o.effectivePrice = o.isOnSale && o.salePrice != null ? o.salePrice : o.price; return o; })() : null;
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
    const docs = await this.courseModel.find({ type }).populate('category').exec();
    return docs.map(d => { const o: any = d.toObject(); o.effectivePrice = o.isOnSale && o.salePrice != null ? o.salePrice : o.price; return o; });
  }
}