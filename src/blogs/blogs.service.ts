import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Blog, BlogDocument, BlogStatus, BlogType } from '../schemas/blog.schema';
import { Category, CategoryDocument } from '../schemas/category.schema';
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
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
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

    // validate category exists
    const catExists = await this.categoryModel.exists({ _id: dto.category });
    if (!catExists) throw new Error('Invalid category');

    const doc = new this.blogModel({
      title: dto.title,
      description: dto.description,
      slug,
      status: dto.status as BlogStatus,
      featuredImage,
      postedBy: userId && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : null,
      postedOn: new Date(),
      category: new Types.ObjectId(dto.category),
      type: (dto as any).type && Object.values(BlogType).includes((dto as any).type) ? (dto as any).type : BlogType.BLOG,
    });
    return doc.save();
  }

  async findAll(filter: Record<string, any> = {}): Promise<Blog[]> {
    return this.blogModel.find(filter).sort({ postedOn: -1 }).populate('category').exec();
  }

  async findAllPaginated(
    page: number,
    limit: number,
    query: { status?: string; slug?: string; category?: string; categorySlug?: string; type?: string } = {}
  ): Promise<{ items: Blog[]; total: number }> {
    const filter: Record<string, any> = {};
    if (query.status) filter.status = query.status;
    if (query.slug) filter.slug = query.slug;
    if (query.type && Object.values(BlogType).includes(query.type as BlogType)) {
      filter.type = query.type;
    }
    if (query.category && Types.ObjectId.isValid(query.category)) filter.category = new Types.ObjectId(query.category);
    if (query.categorySlug) {
      const cat = await this.categoryModel.findOne({ slug: query.categorySlug }, { _id: 1 }).exec();
      if (!cat) return { items: [], total: 0 };
      filter.category = cat._id;
    }
    const [items, total] = await Promise.all([
      this.blogModel
        .find(filter)
        .sort({ postedOn: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('category')
        .exec(),
      this.blogModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  async findOne(id: string): Promise<Blog | null> {
    return this.blogModel.findById(id).populate('category').exec();
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
    if (dto.type && Object.values(BlogType).includes(dto.type)) {
      update.type = dto.type;
    }

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

    if (dto.category && Types.ObjectId.isValid(dto.category)) {
      const catExists = await this.categoryModel.exists({ _id: dto.category });
      if (!catExists) throw new Error('Invalid category');
      update.category = new Types.ObjectId(dto.category);
    }
    return this.blogModel.findByIdAndUpdate(id, update, { new: true }).populate('category').exec();
  }

  async remove(id: string) {
    return this.blogModel.findByIdAndDelete(id).exec();
  }
}
