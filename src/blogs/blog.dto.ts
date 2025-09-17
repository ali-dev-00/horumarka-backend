import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { BlogStatus } from '../schemas/blog.schema';

function normalizeString(value: any): string {
  if (value === undefined || value === null) return value as any;
  if (Array.isArray(value)) value = value[0];
  return String(value).trim();
}

function maybeNormalizeString(value: any): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return normalizeString(value);
}

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => normalizeString(value))
  title: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => normalizeString(value))
  description: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => maybeNormalizeString(value))
  slug?: string;

  @IsEnum(BlogStatus)
  @Transform(({ value }) => normalizeString(value).toUpperCase())
  status: BlogStatus;
}

export class UpdateBlogDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => maybeNormalizeString(value))
  title?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => maybeNormalizeString(value))
  description?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => maybeNormalizeString(value))
  slug?: string;

  @IsOptional()
  @IsEnum(BlogStatus)
  @Transform(({ value }) => (value === undefined ? undefined : normalizeString(value).toUpperCase()))
  status?: BlogStatus;
}
