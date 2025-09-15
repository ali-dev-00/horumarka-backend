import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) {}

  async findAllPaginated(page: number, limit: number): Promise<{ items: Category[]; total: number }> {
    const [items, total] = await Promise.all([
      this.categoryModel
        .find()
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.categoryModel.countDocuments().exec(),
    ]);
    return { items, total };
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category | null> {
    const existing = await this.categoryModel.findOne({ name: createCategoryDto.name });
    if (existing) return null; 
    const createdCategory = new this.categoryModel(createCategoryDto);
    return createdCategory.save();
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async findActive(): Promise<Category[]> {
    return this.categoryModel.find({ status: true }).exec();
  }

  async findOne(id: string): Promise<Category | null> {
    return this.categoryModel.findById(id).exec();
  }
  
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category | null> {
    if (updateCategoryDto.name) {
      const existing = await this.categoryModel.findOne({ 
        name: updateCategoryDto.name,
        _id: { $ne: id }
      });
      if (existing) return null; // ❌ Duplicate
    }
    return this.categoryModel.findByIdAndUpdate(id, updateCategoryDto, { new: true }).exec();
  }
  
  async remove(id: string): Promise<Category | null> {
    return this.categoryModel.findByIdAndDelete(id).exec();
  }

  async toggleStatus(id: string): Promise<Category | null> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) return null;
    category.status = !category.status;
    return category.save();
  }
}