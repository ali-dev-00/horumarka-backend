import { Controller, Get, Post, Body, Param, Delete, Put, Query, NotFoundException, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './role.dto';
import { Role } from '../schemas/role.schema';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/permissions.decorator';
import { Permission } from '../config/permissions';
import { ServerResponse } from '../config/common/response.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/auth/permissions.guard';

@ApiTags('Roles')
@Controller('api/roles')
@ApiBearerAuth('JWT')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Post()
  @RequirePermissions(Permission.ROLE_CREATE)
  @ApiOperation({ summary: 'Create a new role' })
  async create(@Body() createRoleDto: CreateRoleDto): Promise<ServerResponse<Role>> {
    const newRole = await this.rolesService.create(createRoleDto);

    if (!newRole) {
      return {
        status: false,
        message: 'Role with this name already exists',
        data: null,
      };
    }

    return {
      status: true,
      message: 'Role created successfully',
      data: newRole,
    };
  }


  @Get()
  @RequirePermissions(Permission.ROLE_READ)
  @ApiOperation({ summary: 'Get all roles' })
  async findAll(): Promise<ServerResponse<Role[]>> {
    const roles = await this.rolesService.findAll();
    return {
      status: true,
      message: 'Roles fetched successfully',
      data: roles,
    };
  }

  @Get(':id')
  @RequirePermissions(Permission.ROLE_READ)
  @ApiOperation({ summary: 'Get a role by ID' })
  async findOne(@Param('id') id: string): Promise<ServerResponse<Role>> {
    const role = await this.rolesService.findOne(id);
    if (!role) {
      return {
        status: false,
        message: 'Role not found',
        data: null,
      }
    }
    return {
      status: true,
      message: 'Role fetched successfully',
      data: role,
    };
  }

  @Put(':id')
  @RequirePermissions(Permission.ROLE_UPDATE)
  @ApiOperation({ summary: 'Update a role' })
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<ServerResponse<Role>> {
    const updatedRole = await this.rolesService.update(id, updateRoleDto);

    if (!updatedRole) {
      return {
        status: false,
        message: updateRoleDto.name
          ? 'Role with this name already exists'
          : 'Role not found',
        data: null,
      };
    }

    return {
      status: true,
      message: 'Role updated successfully',
      data: updatedRole,
    };
  }

  @Delete(':id')
  @RequirePermissions(Permission.ROLE_DELETE)
  @ApiOperation({ summary: 'Delete a role' })
  async remove(@Param('id') id: string): Promise<ServerResponse<null>> {
    const deletedRole = await this.rolesService.remove(id);
    if (!deletedRole) {
      return {
        status: false,
        message: 'Role not found',
        data: null,
      }
    }
    return {
      status: true,
      message: 'Role deleted successfully',
      data: null,
    };
  }
}