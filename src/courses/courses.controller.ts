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
import { CreateCourseDto, UpdateCourseDto, ModeOfStudy } from './course.dto';
import { Course } from '../schemas/course.schema';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/permissions.decorator';
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
        modeOfStudy: { type: 'string', enum: Object.values(ModeOfStudy) },
        status: { type: 'boolean', default: true },
        thumbnail: { type: 'string', format: 'binary' },
      },
      required: ['title', 'description', 'category', 'whatYouWillLearn', 'location', 'modeOfStudy'],
    },
  })
  @UseInterceptors(FileInterceptor('thumbnail'))
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @UploadedFile() thumbnail?: Express.Multer.File,
  ): Promise<ServerResponse<Course>> {
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
  }

  @Get()
  @RequirePermissions(Permission.COURSE_READ)
  @ApiOperation({ summary: 'Get all courses' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ServerResponse<Course[]>> {
    let courses: Course[];

    if (page && limit) {
      const p = Math.max(parseInt(page, 10) || 1, 1);
      const l = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
      courses = await this.coursesService.findAllPaginated(p, l);
    } else {
      courses = await this.coursesService.findAll();
    }

    return {
      status: true,
      message: 'Courses fetched successfully',
      data: courses,
    };
  }

  @Get(':id')
  @RequirePermissions(Permission.COURSE_READ)
  @ApiOperation({ summary: 'Get a course by ID' })
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
        modeOfStudy: { type: 'string', enum: Object.values(ModeOfStudy) },
        status: { type: 'boolean' },
        thumbnail: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('thumbnail'))
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @UploadedFile() thumbnail?: Express.Multer.File,
  ): Promise<ServerResponse<Course>> {
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