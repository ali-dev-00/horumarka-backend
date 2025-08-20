import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Technology', description: 'Category name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: true, description: 'Category status (active/inactive)', default: true })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}

export class UpdateCategoryDto {
  @ApiProperty({ example: 'Technology', description: 'Category name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: true, description: 'Category status (active/inactive)', required: false })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
