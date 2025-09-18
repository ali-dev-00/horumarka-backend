import { Controller, Get, Post, Body, Param, Delete, Put, UseInterceptors, UploadedFile, Req, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BlogsService } from './blogs.service';
import { CreateBlogDto, UpdateBlogDto } from './blog.dto';
import { Blog } from '../schemas/blog.schema';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/permissions.decorator';
import { Permission } from '../config/permissions';
import { ServerResponse } from '../config/common/response.dto';

@ApiTags('Blogs')
@Controller('api/blogs')
@ApiBearerAuth('JWT')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @RequirePermissions(Permission.BLOG_CREATE)
  @ApiOperation({ summary: 'Create a new blog post' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        slug: { type: 'string' },
        status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] },
        category: { type: 'string', description: 'Category ObjectId' },
        type: { type: 'string', enum: ['BLOG', 'NEWS', 'CAREER_STORY'], description: 'Blog type (default BLOG)' },
        featuredImage: { type: 'string', format: 'binary' },
      },
      required: ['title', 'description', 'status', 'featuredImage', 'category'],
    },
  })
  @UseInterceptors(FileInterceptor('featuredImage'))
  async create(
    @Body() dto: CreateBlogDto,
    @UploadedFile() featuredImage?: Express.Multer.File,
    @Req() req?: any,
  ): Promise<ServerResponse<Blog>> {
    try {
      const userId: string | undefined = req?.user?.userId;
      const blog = await this.blogsService.create(dto, featuredImage, userId);
      if (!blog) {
        return { status: false, message: 'Blog with this title already exists', data: null };
      }
      return { status: true, message: 'Blog created', data: blog };
    } catch (err) {
      return { status: false, message: (err as Error)?.message || 'Internal server error', data: null };
    }
  }

  @Get()
  @RequirePermissions(Permission.BLOG_READ)
  @ApiOperation({ summary: 'List blogs with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'slug', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Category ObjectId' })
  @ApiQuery({ name: 'categorySlug', required: false, type: String, description: 'Category slug' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: string,
    @Query('slug') slug?: string,
    @Query('category') category?: string,
    @Query('categorySlug') categorySlug?: string,
  ): Promise<ServerResponse<Blog[]>> {
    const p = Math.max(parseInt(page, 10) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const { items, total } = await this.blogsService.findAllPaginated(p, l, { status, slug, category, categorySlug });
    return { status: true, message: 'Blogs fetched', data: items, pagination: { page: p, limit: l, total } };
  }

  @Get(':id')
  @RequirePermissions(Permission.BLOG_READ)
  @ApiOperation({ summary: 'Get blog by id' })
  async findOne(@Param('id') id: string): Promise<ServerResponse<Blog>> {
    const item = await this.blogsService.findOne(id);
    if (!item) return { status: false, message: 'Blog not found', data: null };
    return { status: true, message: 'Blog fetched', data: item };
  }

  @Put(':id')
  @RequirePermissions(Permission.BLOG_UPDATE)
  @ApiOperation({ summary: 'Update blog' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        slug: { type: 'string' },
        status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] },
        category: { type: 'string', description: 'Category ObjectId' },
        type: { type: 'string', enum: ['BLOG', 'NEWS', 'CAREER_STORY'] },
        featuredImage: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('featuredImage'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBlogDto,
    @UploadedFile() featuredImage?: Express.Multer.File,
  ): Promise<ServerResponse<Blog>> {
    try {
      const updated = await this.blogsService.update(id, dto, featuredImage);
      if (!updated) return { status: false, message: 'Title already exists or blog not found', data: null };
      return { status: true, message: 'Blog updated', data: updated };
    } catch (err) {
      return { status: false, message: (err as Error)?.message || 'Internal server error', data: null };
    }
  }

  @Delete(':id')
  @RequirePermissions(Permission.BLOG_DELETE)
  @ApiOperation({ summary: 'Delete blog' })
  async remove(@Param('id') id: string) {
    const deleted = await this.blogsService.remove(id);
    if (!deleted) return { status: false, message: 'Blog not found', data: null };
    return { status: true, message: 'Blog deleted', data: null };
  }
}
