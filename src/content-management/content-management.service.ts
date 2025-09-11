import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContentManagement, ContentManagementDocument } from '../schemas/content-management.schema';
import { CreateContentManagementDto, UpdateContentManagementDto } from './content-management.dto';

@Injectable()
export class ContentManagementService {
  constructor(
    @InjectModel(ContentManagement.name)
    private contentManagementModel: Model<ContentManagementDocument>,
  ) {}

  async create(createContentManagementDto: CreateContentManagementDto): Promise<ContentManagement> {
    try {
      // Validate JSON content
      try {
        JSON.parse(createContentManagementDto.sectionContent);
      } catch (error) {
        throw new ConflictException('Invalid JSON format in sectionContent');
      }

      const createdContent = new this.contentManagementModel(createContentManagementDto);
      return await createdContent.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Section name already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<ContentManagement[]> {
    return await this.contentManagementModel.find().exec();
  }

  async findById(id: string): Promise<ContentManagement> {
    const content = await this.contentManagementModel.findById(id).exec();
    if (!content) {
      throw new NotFoundException('Content section not found');
    }
    return content;
  }

  async findBySectionName(sectionName: string): Promise<ContentManagement> {
    const content = await this.contentManagementModel
      .findOne({ sectionName })
      .exec();
    
    if (!content) {
      throw new NotFoundException(`Content section '${sectionName}' not found`);
    }
    return content;
  }

  async update(id: string, updateContentManagementDto: UpdateContentManagementDto): Promise<ContentManagement> {
    // Validate JSON content if provided
    if (updateContentManagementDto.sectionContent) {
      try {
        JSON.parse(updateContentManagementDto.sectionContent);
      } catch (error) {
        throw new ConflictException('Invalid JSON format in sectionContent');
      }
    }

    const updatedContent = await this.contentManagementModel
      .findByIdAndUpdate(id, updateContentManagementDto, { new: true })
      .exec();

    if (!updatedContent) {
      throw new NotFoundException('Content section not found');
    }

    return updatedContent;
  }

  async updateBySectionName(
    sectionName: string, 
    updateContentManagementDto: UpdateContentManagementDto
  ): Promise<ContentManagement> {
    // Validate JSON content if provided
    if (updateContentManagementDto.sectionContent) {
      try {
        JSON.parse(updateContentManagementDto.sectionContent);
      } catch (error) {
        throw new ConflictException('Invalid JSON format in sectionContent');
      }
    }

    const updatedContent = await this.contentManagementModel
      .findOneAndUpdate(
        { sectionName },
        updateContentManagementDto,
        { new: true }
      )
      .exec();

    if (!updatedContent) {
      throw new NotFoundException(`Content section '${sectionName}' not found`);
    }

    return updatedContent;
  }

  async remove(id: string): Promise<void> {
    const result = await this.contentManagementModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Content section not found');
    }
  }

  async removeBySectionName(sectionName: string): Promise<void> {
    const result = await this.contentManagementModel
      .findOneAndDelete({ sectionName })
      .exec();
    
    if (!result) {
      throw new NotFoundException(`Content section '${sectionName}' not found`);
    }
  }

  // Get parsed JSON content
  async getParsedContent(sectionName: string): Promise<any> {
    const content = await this.findBySectionName(sectionName);
    try {
      return JSON.parse(content.sectionContent);
    } catch (error) {
      throw new ConflictException('Invalid JSON format in stored content');
    }
  }
}
