import { IsString, IsArray, IsEnum, IsOptional } from 'class-validator';
import { Permission } from '../config/permissions';

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsArray()
  @IsEnum(Permission, { each: true })
  permissions: Permission[];
}

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsEnum(Permission, { each: true })
  @IsOptional()
  permissions?: Permission[];
}
