import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/permissions.decorator';
import { Permission } from '../config/permissions';
import { ServerResponse } from '../config/common/response.dto';
import { User } from '../schemas/user.schema';

@ApiTags('Users')
@Controller('api/users')
@ApiBearerAuth('JWT')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions(Permission.USER_CREATE)
  @ApiOperation({ summary: 'Create a new user' })
  async create(@Body() createUserDto: CreateUserDto): Promise<ServerResponse<User>> {
    const newUser = await this.usersService.create(createUserDto);
    if (!newUser) {
      return { status: false, message: 'Email already exists', data: null };
    }
    return { status: true, message: 'User created successfully', data: newUser };
  }

  @Get()
  @RequirePermissions(Permission.USER_READ)
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10): Promise<ServerResponse<User[]>> {
    const users = await this.usersService.findAllPaginated(+page, +limit);
    return { status: true, message: 'Users fetched successfully', data: users };
  }

  @Get('all')
  @RequirePermissions(Permission.USER_READ)
  @ApiOperation({ summary: 'Get all users without pagination' })
  async findAllWithoutPagination(): Promise<ServerResponse<User[]>> {
    const users = await this.usersService.findAll();
    return { status: true, message: 'All users retrieved successfully', data: users };
  }

  @Get(':id')
  @RequirePermissions(Permission.USER_READ)
  @ApiOperation({ summary: 'Get a user by ID' })
  async findOne(@Param('id') id: string): Promise<ServerResponse<User>> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      return { status: false, message: 'User not found', data: null };
    }
    return { status: true, message: 'User fetched successfully', data: user };
  }

  @Put(':id')
  @RequirePermissions(Permission.USER_UPDATE)
  @ApiOperation({ summary: 'Update a user' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<ServerResponse<User>> {
    const updatedUser = await this.usersService.update(id, updateUserDto);
    if (!updatedUser) {
      return { status: false, message: updateUserDto.email ? 'Email already exists' : 'User not found', data: null };
    }
    return { status: true, message: 'User updated successfully', data: updatedUser };
  }

  @Delete(':id')
  @RequirePermissions(Permission.USER_DELETE)
  @ApiOperation({ summary: 'Delete a user' })
  async remove(@Param('id') id: string): Promise<ServerResponse<null>> {
    const deleted = await this.usersService.remove(id);
    if (!deleted) {
      return { status: false, message: 'User not found', data: null };
    }
    return { status: true, message: 'User deleted successfully', data: null };
  }
}