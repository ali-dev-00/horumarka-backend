import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto, ModeOfStudy, CourseType } from './course.dto';
import { Course } from '../schemas/course.schema';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/permissions.decorator';
import { Public } from '../auth/public.decorator';
import { Permission } from '../config/permissions';
import { ServerResponse } from '../config/common/response.dto';

@ApiTags('Courses')
@Controller('api/courses')
@ApiBearerAuth('JWT')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @RequirePermissions(Permission.COURSE_CREATE)
  @ApiOperation({ summary: 'Create a new course' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string', description: 'Category ObjectId' },
        whatYouWillLearn: { type: 'string' }, // string (not array)
        location: { type: 'string' },
        duration: { type: 'string' },
        modeOfStudy: { type: 'string', enum: Object.values(ModeOfStudy) },
        status: { type: 'boolean', default: true },
        thumbnail: { type: 'string', format: 'binary' },
        noOfVacancies: { type: 'integer', minimum: 0 },
        type: { type: 'string', enum: Object.values(CourseType) },
        price: { type: 'integer', minimum: 0 },
        isBestSeller: { type: 'boolean', default: false },
        isOnSale: { type: 'boolean', default: false },
        salePrice: { type: 'integer', minimum: 0 },
      },
  required: ['title', 'description', 'category', 'whatYouWillLearn', 'location', 'duration', 'modeOfStudy', 'noOfVacancies', 'type', 'status', 'thumbnail', 'price', 'isBestSeller', 'isOnSale'],
    },
  })
  @UseInterceptors(FileInterceptor('thumbnail'))
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @UploadedFile() thumbnail?: Express.Multer.File,
  ): Promise<ServerResponse<Course>> {
    // Debug logs for diagnostics
    try {
      console.log('[CoursesController:create] payload:', {
        ...createCourseDto,
        // avoid logging large strings
        description: createCourseDto?.description?.slice?.(0, 120),
        whatYouWillLearn: createCourseDto?.whatYouWillLearn?.slice?.(0, 120),
      });
      console.log('[CoursesController:create] thumbnail provided:', !!thumbnail);
    } catch {}
    if (!thumbnail) {
      return {
        status: false,
        message: 'Thumbnail is required',
        data: null,
      };
    }
    try {
      const newCourse = await this.coursesService.create(createCourseDto, thumbnail);

      if (!newCourse) {
        return {
          status: false,
          message: 'Course with this title already exists',
          data: null,
        };
      }

      return {
        status: true,
        message: 'Course created successfully',
        data: newCourse,
      };
    } catch (err) {
      console.error('[CoursesController:create] error:', err);
      return {
        status: false,
        message: (err as Error)?.message || 'Internal server error',
        data: null,
      };
    }
  }

  @Get()
  @RequirePermissions(Permission.COURSE_READ)
  @ApiOperation({ summary: 'Get all courses with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'isBestSeller', required: false, type: Boolean })
  @ApiQuery({ name: 'isOnSale', required: false, type: Boolean })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('isBestSeller') isBestSeller?: string,
    @Query('isOnSale') isOnSale?: string,
  ): Promise<ServerResponse<Course[]>> {
    const p = Math.max(parseInt(page, 10) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const filters: Record<string, any> = {};
    if (isBestSeller !== undefined) filters.isBestSeller = ['true', '1', 'yes'].includes(isBestSeller.toLowerCase());
    if (isOnSale !== undefined) filters.isOnSale = ['true', '1', 'yes'].includes(isOnSale.toLowerCase());
    const { items, total } = await this.coursesService.findAllPaginated(p, l, filters);
    return {
      status: true,
      message: 'Courses fetched successfully',
      data: items,
      pagination: { page: p, limit: l, total },
    };
  }

  @Get('all')
  @RequirePermissions(Permission.COURSE_READ)
  @ApiOperation({ summary: 'Get all courses without pagination' })
  async findAllWithoutPagination(): Promise<ServerResponse<Course[]>> {
    const courses = await this.coursesService.findAll();
    return { status: true, message: 'Courses fetched successfully', data: courses };
  }

  @Get('by-type')
  @Public()
  @ApiOperation({ summary: 'Get courses by type (public)' })
  async findByType(@Query('type') type: string): Promise<ServerResponse<Course[]>> {
    if (!type || !Object.values(CourseType).includes(type as any)) {
      return {
        status: false,
        message: 'Invalid or missing course type',
        data: [],
      };
    }
    const courses = await this.coursesService.findByType(type);
    return {
      status: true,
      message: 'Courses fetched successfully',
      data: courses,
    };
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a course by ID (public)' })
  async findOne(@Param('id') id: string): Promise<ServerResponse<Course>> {
    const course = await this.coursesService.findOne(id);
    if (!course) {
      return {
        status: false,
        message: 'Course not found',
        data: null,
      };
    }
    return {
      status: true,
      message: 'Course fetched successfully',
      data: course,
    };
  }

  @Put(':id')
  @RequirePermissions(Permission.COURSE_UPDATE)
  @ApiOperation({ summary: 'Update a course' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string' },
        whatYouWillLearn: { type: 'string' }, // string (not array)
        location: { type: 'string' },
  duration: { type: 'string' },
        modeOfStudy: { type: 'string', enum: Object.values(ModeOfStudy) },
        noOfVacancies: { type: 'integer', minimum: 0 },
        type: { type: 'string', enum: Object.values(CourseType) },
        status: { type: 'boolean' },
        thumbnail: { type: 'string', format: 'binary' },
        price: { type: 'integer', minimum: 0 },
        isBestSeller: { type: 'boolean' },
        isOnSale: { type: 'boolean' },
        salePrice: { type: 'integer', minimum: 0 },
      },
    },
  })
  @UseInterceptors(FileInterceptor('thumbnail'))
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @UploadedFile() thumbnail?: Express.Multer.File,
  ): Promise<ServerResponse<Course>> {
    try {
      console.log('[CoursesController:update] id:', id);
      console.log('[CoursesController:update] payload:', {
        ...updateCourseDto,
        description: updateCourseDto?.description?.slice?.(0, 120),
        whatYouWillLearn: updateCourseDto?.whatYouWillLearn?.slice?.(0, 120),
      });
      console.log('[CoursesController:update] thumbnail provided:', !!thumbnail);

      const updatedCourse = await this.coursesService.update(id, updateCourseDto, thumbnail);

      if (!updatedCourse) {
        return {
          status: false,
          message: updateCourseDto.title
            ? 'Course with this title already exists'
            : 'Course not found',
          data: null,
        };
      }

      return {
        status: true,
        message: 'Course updated successfully',
        data: updatedCourse,
      };
    } catch (err) {
      console.error('[CoursesController:update] error:', err);
      return {
        status: false,
        message: (err as Error)?.message || 'Internal server error',
        data: null,
      };
    }
  }

  @Delete(':id')
  @RequirePermissions(Permission.COURSE_DELETE)
  @ApiOperation({ summary: 'Delete a course' })
  async remove(@Param('id') id: string): Promise<ServerResponse<null>> {
    const deleted = await this.coursesService.remove(id);
    if (!deleted) {
      return {
        status: false,
        message: 'Course not found',
        data: null,
      };
    }
    return {
      status: true,
      message: 'Course deleted successfully',
      data: null,
    };
  }
}