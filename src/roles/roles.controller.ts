import { Controller, Get, Post, Body, Param, Delete, Put, Query, NotFoundException } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './role.dto';
import { Role } from '../schemas/role.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ALL_PERMISSIONS } from '../config/permissions';  // Import all permissions

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // Create role
  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiBody({
    description: 'The role to create',
    type: CreateRoleDto,
    examples: {
      'application/json': {
        value: {
          name: 'Admin',
          permissions: ALL_PERMISSIONS,  // Show all available permissions
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'The role has been successfully created.' })
  async create(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.rolesService.create(createRoleDto);
  }

  // Get all roles with pagination
  @Get()
  @ApiOperation({ summary: 'Get all roles (paginated)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'List of all roles.',
    type: [Role],
  })
  async findAllPaginated(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const data = await this.rolesService.findAllPaginated(+page || 1, +limit || 10);
    return {
      status: true,
      message: 'Roles fetched successfully',
      page,
      limit,
      items: data,
    };
  }

  // Get role by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role found.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  async findOne(@Param('id') id: string): Promise<Role> {
    const role = await this.rolesService.findOne(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  // Update role
  @Put(':id')
  @ApiOperation({ summary: 'Update a role' })
  @ApiParam({ name: 'id', required: true, description: 'Role ID' })
  @ApiBody({
    description: 'The role data to update',
    type: UpdateRoleDto,
    examples: {
      'application/json': {
        value: {
          name: 'Admin Updated',
          permissions: ALL_PERMISSIONS,  // Show all available permissions
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Role updated successfully.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.rolesService.update(id, updateRoleDto);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  // Delete role
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a role' })
  @ApiParam({ name: 'id', required: true, description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  async remove(@Param('id') id: string): Promise<any> {
    return this.rolesService.remove(id);
  }
}
