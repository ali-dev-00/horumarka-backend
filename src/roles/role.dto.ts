import { IsString, IsArray, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { Permission } from '../config/permissions';

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsArray()
  @IsEnum(Permission, { each: true })
  permissions: Permission[];

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsEnum(Permission, { each: true })
  @IsOptional()
  permissions?: Permission[];

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
