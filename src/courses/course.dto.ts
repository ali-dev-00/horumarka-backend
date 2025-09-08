import { IsString, IsEnum, IsOptional, IsBoolean, IsMongoId } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ModeOfStudy {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  HYBRID = 'HYBRID',
}

export class CreateCourseDto {
  @IsString() title: string;
  @IsString() description: string;
  @IsMongoId() category: string;

  @IsString()
  @Transform(({ value }) => String(Array.isArray(value) ? value[0] : value).trim())
  whatYouWillLearn: string;

  @IsString()
  @Transform(({ value }) => String(Array.isArray(value) ? value[0] : value).trim())
  location: string;

  @IsEnum(ModeOfStudy) modeOfStudy: ModeOfStudy;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  status?: boolean;
}

export class UpdateCourseDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsMongoId() category?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === undefined ? undefined : String(Array.isArray(value) ? value[0] : value).trim()))
  whatYouWillLearn?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === undefined ? undefined : String(Array.isArray(value) ? value[0] : value).trim()))
  location?: string;

  @IsOptional() @IsEnum(ModeOfStudy) modeOfStudy?: ModeOfStudy;
  @IsOptional() @IsBoolean() @Transform(({ value }) => toBoolean(value)) status?: boolean;
}
// Helpers for multipart/form-data friendliness
function normalizeString(value: any): string {
  if (value === undefined || value === null) return value as any;
  if (Array.isArray(value)) value = value[0];
  return String(value).trim();
}

function maybeNormalizeString(value: any): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return normalizeString(value);
}

function toBoolean(value: any): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(v)) return true;
    if (['false', '0', 'no', 'off'].includes(v)) return false;
  }
  if (typeof value === 'number') return value === 1;
  return undefined;
}