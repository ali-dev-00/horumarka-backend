import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContentManagementService } from './content-management.service';
import { 
  CreateContentManagementDto, 
  UpdateContentManagementDto, 
  ContentManagementResponseDto 
} from './content-management.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { Permission } from '../config/permissions';
import { multerConfig } from './multer.config';

@ApiTags('Content Management')
@Controller('api/content-management')
@ApiBearerAuth('JWT')
export class ContentManagementController {
  constructor(private readonly contentManagementService: ContentManagementService) {}

  @Post()
  @RequirePermissions(Permission.CONTENT_MANAGEMENT_CREATE)
  @ApiOperation({ summary: 'Create new content section by section name' })
  @ApiResponse({
    status: 201,
    description: 'Content section created successfully',
    type: ContentManagementResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Section name already exists or invalid JSON' })
  async create(@Body() createContentManagementDto: CreateContentManagementDto) {
    const content = await this.contentManagementService.create(createContentManagementDto);
    return {
      status: true,
      message: 'Content section created successfully',
      data: content
    };
  }

  @Get(':sectionName')
  @RequirePermissions(Permission.CONTENT_MANAGEMENT_READ)
  @ApiOperation({ summary: 'Get content by unique section name' })
  @ApiParam({ name: 'sectionName', description: 'Unique section name' })
  @ApiResponse({
    status: 200,
    description: 'Content section found',
    type: ContentManagementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Content section not found' })
  async findBySectionName(@Param('sectionName') sectionName: string) {
    const content = await this.contentManagementService.findBySectionName(sectionName);
    return {
      status: true,
      message: 'Content section found successfully',
      data: content
    };
  }

  @Patch(':sectionName')
  @RequirePermissions(Permission.CONTENT_MANAGEMENT_UPDATE)
  @ApiOperation({ summary: 'Update content section by unique section name' })
  @ApiParam({ name: 'sectionName', description: 'Unique section name' })
  @ApiResponse({
    status: 200,
    description: 'Content section updated successfully',
    type: ContentManagementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Content section not found' })
  @ApiResponse({ status: 409, description: 'Invalid JSON format' })
  async updateBySectionName(
    @Param('sectionName') sectionName: string,
    @Body() updateContentManagementDto: UpdateContentManagementDto,
  ) {
    const content = await this.contentManagementService.updateBySectionName(
      sectionName,
      updateContentManagementDto,
    );
    return {
      status: true,
      message: 'Content section updated successfully',
      data: content
    };
  }

  @Post('upload/:sectionName')
  @RequirePermissions(Permission.CONTENT_MANAGEMENT_CREATE, Permission.CONTENT_MANAGEMENT_UPDATE)
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @ApiOperation({ summary: 'Create or update content section with image upload' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'sectionName', description: 'Unique section name' })
  @ApiResponse({
    status: 200,
    description: 'Content section created/updated successfully with image',
    type: ContentManagementResponseDto,
  })
  async uploadContent(
    @Param('sectionName') sectionName: string,
    @Body() contentData: any,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const content = await this.contentManagementService.upsertContentWithImage(
      sectionName,
      contentData,
      image,
    );
    return {
      status: true,
      message: 'Content section uploaded successfully',
      data: content
    };
  }

  @Get('parsed/:sectionName')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.CONTENT_MANAGEMENT_READ)
  @ApiOperation({ summary: 'Get parsed JSON content by section name' })
  @ApiParam({ name: 'sectionName', description: 'Unique section name' })
  @ApiResponse({
    status: 200,
    description: 'Parsed content retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Content section not found' })
  async getParsedContent(@Param('sectionName') sectionName: string) {
    const parsedContent = await this.contentManagementService.getParsedContent(sectionName);
    return {
      status: true,
      message: 'Parsed content retrieved successfully',
      data: parsedContent,
    };
  }
}
