import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/permissions.decorator';
import { Permission } from '../config/permissions';
import { Public } from '../auth/public.decorator';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiBearerAuth('JWT')
  @RequirePermissions(Permission.CATEGORY_CREATE)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category successfully created.' })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiBearerAuth('JWT')
  @RequirePermissions(Permission.CATEGORY_READ)
  @ApiOperation({ summary: 'Get all categories with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully.' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.categoriesService.findAllPaginated(page, limit);
  }

  @Get('all')
  @Public()
  @ApiOperation({ summary: 'Get all categories without pagination (Public)' })
  @ApiResponse({ status: 200, description: 'All categories retrieved successfully.' })
  async findAllWithoutPagination() {
    return this.categoriesService.findAll();
  }

  @Get('active')
  @Public()
  @ApiOperation({ summary: 'Get all active categories (Public)' })
  @ApiResponse({ status: 200, description: 'Active categories retrieved successfully.' })
  async findActive() {
    return this.categoriesService.findActive();
  }

  @Get(':id')
  @ApiBearerAuth('JWT')
  @RequirePermissions(Permission.CATEGORY_READ)
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT')
  @RequirePermissions(Permission.CATEGORY_UPDATE)
  @ApiOperation({ summary: 'Update a category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Patch(':id/toggle-status')
  @ApiBearerAuth('JWT')
  @RequirePermissions(Permission.CATEGORY_TOGGLE_STATUS)
  @ApiOperation({ summary: 'Toggle category status (active/inactive)' })
  @ApiResponse({ status: 200, description: 'Category status toggled successfully.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  async toggleStatus(@Param('id') id: string) {
    return this.categoriesService.toggleStatus(id);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT')
  @RequirePermissions(Permission.CATEGORY_DELETE)
  @ApiOperation({ summary: 'Delete a category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
