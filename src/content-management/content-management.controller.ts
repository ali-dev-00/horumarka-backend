import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
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

@ApiTags('Content Management')
@Controller('api/content-management')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ContentManagementController {
  constructor(private readonly contentManagementService: ContentManagementService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.CONTENT_MANAGEMENT_CREATE)
  @ApiOperation({ summary: 'Create new content section by section name' })
  @ApiResponse({
    status: 201,
    description: 'Content section created successfully',
    type: ContentManagementResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Section name already exists or invalid JSON' })
  async create(@Body() createContentManagementDto: CreateContentManagementDto) {
    return await this.contentManagementService.create(createContentManagementDto);
  }

  @Get(':sectionName')
  @UseGuards(PermissionsGuard)
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
    return await this.contentManagementService.findBySectionName(sectionName);
  }

  @Patch(':sectionName')
  @UseGuards(PermissionsGuard)
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
    return await this.contentManagementService.updateBySectionName(
      sectionName,
      updateContentManagementDto,
    );
  }
}
