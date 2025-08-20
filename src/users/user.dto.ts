import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Role ID (ObjectId)' })
  @IsString()
  @IsNotEmpty()
  roleId: string;
}

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'User full name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'john@example.com', description: 'User email address', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'password123', description: 'User password', required: false })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Role ID (ObjectId)', required: false })
  @IsString()
  @IsOptional()
  roleId?: string;
}
