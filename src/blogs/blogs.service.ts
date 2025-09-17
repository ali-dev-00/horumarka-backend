import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Blog, BlogDocument, BlogStatus } from '../schemas/blog.schema';
import { CreateBlogDto, UpdateBlogDto } from './blog.dto';
import { UploadService } from '../cloudinary/upload.service';

function slugify(str: string): string {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    private readonly uploadService: UploadService,
  ) {}

  async create(dto: CreateBlogDto, image: Express.Multer.File | undefined, userId?: string): Promise<Blog | null> {
    const titleExists = await this.blogModel.findOne({ title: dto.title }).exec();
    if (titleExists) return null;

    // slug: explicit or from title
    let slug = dto.slug && dto.slug.length ? slugify(dto.slug) : slugify(dto.title);
    // ensure unique slug by appending counter if needed
    let base = slug;
    let i = 1;
    while (await this.blogModel.exists({ slug })) {
      slug = `${base}-${i++}`;
    }

    if (!image) {
      // featured image is required
      throw new Error('Featured image is required');
    }

    const uploaded = await this.uploadService.uploadImage(image);
    const featuredImage = uploaded.secure_url;

    const doc = new this.blogModel({
      title: dto.title,
      description: dto.description,
      slug,
      status: dto.status as BlogStatus,
      featuredImage,
      postedBy: userId && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : null,
      postedOn: new Date(),
    });
    return doc.save();
  }

  async findAll(): Promise<Blog[]> {
    return this.blogModel.find().sort({ postedOn: -1 }).exec();
  }

  async findAllPaginated(page: number, limit: number): Promise<{ items: Blog[]; total: number }> {
    const [items, total] = await Promise.all([
      this.blogModel
        .find()
        .sort({ postedOn: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.blogModel.countDocuments().exec(),
    ]);
    return { items, total };
  }

  async findOne(id: string): Promise<Blog | null> {
    return this.blogModel.findById(id).exec();
  }

  async update(id: string, dto: UpdateBlogDto, image?: Express.Multer.File): Promise<Blog | null> {
    // unique title check
    if (dto.title) {
      const exists = await this.blogModel.findOne({ title: dto.title, _id: { $ne: new Types.ObjectId(id) } });
      if (exists) return null;
    }

    const update: Record<string, unknown> = {};
    Object.entries(dto).forEach(([k, v]) => {
      if (v !== undefined && v !== null && !(typeof v === 'string' && v.trim() === '')) update[k] = v;
    });

    if (dto.slug || dto.title) {
      const candidate = dto.slug && dto.slug.length ? dto.slug : dto.title!;
      let slug = slugify(candidate);
      let base = slug;
      let i = 1;
      while (await this.blogModel.exists({ slug, _id: { $ne: new Types.ObjectId(id) } })) {
        slug = `${base}-${i++}`;
      }
      update.slug = slug;
    }

    if (image) {
      const up = await this.uploadService.uploadImage(image);
      update.featuredImage = up.secure_url;
    }

    return this.blogModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async remove(id: string) {
    return this.blogModel.findByIdAndDelete(id).exec();
  }
}
