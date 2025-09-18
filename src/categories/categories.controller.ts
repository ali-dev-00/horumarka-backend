import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/permissions.decorator';
import { Permission } from '../config/permissions';
import { ServerResponse } from '../config/common/response.dto';
import { Category } from '../schemas/category.schema';
import { Public } from 'src/auth/public.decorator';

@ApiTags('Categories')
@Controller('api/categories')
@ApiBearerAuth('JWT')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @RequirePermissions(Permission.CATEGORY_CREATE)
  @ApiOperation({ summary: 'Create a new category' })
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<ServerResponse<Category>> {
    const newCategory = await this.categoriesService.create(createCategoryDto);
    if (!newCategory) {
      return { status: false, message: 'Category with this name already exists', data: null };
    }
    return { status: true, message: 'Category created successfully', data: newCategory };
  }

  @Get()
  @RequirePermissions(Permission.CATEGORY_READ)
  @ApiOperation({ summary: 'Get all categories (paginated)' })
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10): Promise<ServerResponse<Category[]>> {
    const p = Math.max(+page || 1, 1);
    const l = Math.min(Math.max(+limit || 10, 1), 100);
    const { items, total } = await this.categoriesService.findAllPaginated(p, l);
    return {
      status: true,
      message: 'Categories fetched successfully',
      data: items,
      pagination: { page: p, limit: l, total },
    };
  }

  @Get('all')
  @Public()
  @ApiOperation({ summary: 'Get all categories without pagination (Public)' })
  async findAllWithoutPagination(): Promise<ServerResponse<Category[]>> {
    const categories = await this.categoriesService.findAll();
    return { status: true, message: 'All categories fetched successfully', data: categories };
  }

  @Get('active')
  @Public()
  @ApiOperation({ summary: 'Get all active categories (Public)' })
  async findActive(): Promise<ServerResponse<Category[]>> {
    const categories = await this.categoriesService.findActive();
    return { status: true, message: 'Active categories fetched successfully', data: categories };
  }

  @Get(':id')
  @RequirePermissions(Permission.CATEGORY_READ)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get a category by ID' })
  async findOne(@Param('id') id: string): Promise<ServerResponse<Category>> {
    const category = await this.categoriesService.findOne(id);
    if (!category) {
      return { status: false, message: 'Category not found', data: null };
    }
    return { status: true, message: 'Category fetched successfully', data: category };
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get a category by slug (Public)' })
  async findBySlug(@Param('slug') slug: string): Promise<ServerResponse<Category>> {
    const category = await this.categoriesService.findBySlug(slug);
    if (!category) return { status: false, message: 'Category not found', data: null };
    return { status: true, message: 'Category fetched successfully', data: category };
  }

  @Put(':id')
  @ApiBearerAuth('JWT')
  @RequirePermissions(Permission.CATEGORY_UPDATE)
  @ApiOperation({ summary: 'Update a category' })
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto): Promise<ServerResponse<Category>> {
    const updatedCategory = await this.categoriesService.update(id, updateCategoryDto);
    if (!updatedCategory) {
      return { status: false, message: updateCategoryDto.name ? 'Category with this name already exists' : 'Category not found', data: null };
    }
    return { status: true, message: 'Category updated successfully', data: updatedCategory };
  }

  @Put(':id/toggle-status')
  @ApiBearerAuth('JWT')
  @RequirePermissions(Permission.CATEGORY_UPDATE)
  @ApiOperation({ summary: 'Toggle category status (active/inactive)' })
  async toggleStatus(@Param('id') id: string): Promise<ServerResponse<Category>> {
    const category = await this.categoriesService.toggleStatus(id);
    if (!category) {
      return { status: false, message: 'Category not found', data: null };
    }
    return { status: true, message: 'Category status toggled successfully', data: category };
  }

  @Delete(':id')
  @ApiBearerAuth('JWT')
  @RequirePermissions(Permission.CATEGORY_DELETE)
  @ApiOperation({ summary: 'Delete a category' })
  async remove(@Param('id') id: string): Promise<ServerResponse<null>> {
    const deleted = await this.categoriesService.remove(id);
    if (!deleted) {
      return { status: false, message: 'Category not found', data: null };
    }
    return { status: true, message: 'Category deleted successfully', data: null };
  }
}