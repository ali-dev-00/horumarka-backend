import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@gmail.com', description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'admin@123', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'Admin', description: 'User full name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'admin@gmail.com', description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'admin@123', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Role ID (ObjectId)' })
  @IsString()
  @IsNotEmpty()
  roleId: string;
}