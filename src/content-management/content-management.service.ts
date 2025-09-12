import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContentManagement, ContentManagementDocument } from '../schemas/content-management.schema';
import { CreateContentManagementDto, UpdateContentManagementDto } from './content-management.dto';
import { UploadService } from '../cloudinary/upload.service';

@Injectable()
export class ContentManagementService {
  constructor(
    @InjectModel(ContentManagement.name)
    private contentManagementModel: Model<ContentManagementDocument>,
    private readonly uploadService: UploadService,
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

  // Create or update content with image upload
  async upsertContentWithImage(
    sectionName: string,
    contentData: any,
    image?: Express.Multer.File
  ): Promise<ContentManagement> {
    try {
      let imageUrl = '';
      
      // Upload image to Cloudinary if provided
      if (image) {
        const uploadResult = await this.uploadService.uploadImage(image);
        imageUrl = uploadResult.secure_url;
      }

      // Add image URL to content data
      const finalContentData = {
        ...contentData,
        ...(imageUrl && { image: imageUrl })
      };

      // Validate JSON format
      try {
        JSON.stringify(finalContentData);
      } catch (error) {
        throw new ConflictException('Invalid content data format');
      }

      // Check if content section already exists
      try {
        const existingContent = await this.findBySectionName(sectionName);
        // Update existing content
        return await this.updateBySectionName(sectionName, {
          sectionContent: JSON.stringify(finalContentData)
        });
      } catch (error) {
        if (error instanceof NotFoundException) {
          // Create new content
          return await this.create({
            sectionName,
            sectionContent: JSON.stringify(finalContentData)
          });
        }
        throw error;
      }
    } catch (error) {
      // Handle specific Cloudinary errors
      if (error.message && error.message.includes('File too large')) {
        throw new ConflictException('Image file is too large. Please upload an image smaller than 10MB.');
      }
      
      // Handle other Cloudinary errors
      if (error.message && error.message.includes('Invalid image')) {
        throw new ConflictException('Invalid image format. Please upload a valid image file.');
      }
      
      throw error;
    }
  }
}
