import { IsString, IsEnum, IsOptional, IsBoolean, IsMongoId, IsInt, Min } from 'class-validator';
export enum CourseType {
  TRENDING = 'TRENDING',
  UPCOMING = 'UPCOMING',
  BEST_SELLER = 'BEST_SELLER',
}
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ModeOfStudy {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  HYBRID = 'HYBRID',
}

export class CreateCourseDto {
  @IsString()
  @Transform(({ value }) => normalizeString(value))
  title: string;

  @IsString()
  @Transform(({ value }) => normalizeString(value))
  description: string;

  @IsMongoId()
  @Transform(({ value }) => normalizeString(value))
  category: string;

  @IsString()
  @Transform(({ value }) => String(Array.isArray(value) ? value[0] : value).trim())
  whatYouWillLearn: string;

  @IsString()
  @Transform(({ value }) => String(Array.isArray(value) ? value[0] : value).trim())
  location: string;

  @IsEnum(ModeOfStudy) modeOfStudy: ModeOfStudy;

  @IsInt() @Min(0)
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (Array.isArray(value)) value = value[0];
    const n = parseInt(value as any, 10);
    return Number.isNaN(n) ? undefined : n;
  })
  noOfVacancies: number;

  @IsEnum(CourseType)
  type: CourseType;

  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  status: boolean;

  @IsString()
  @Transform(({ value }) => normalizeString(value))
  duration: string;
}

export class UpdateCourseDto {
  @IsOptional() @IsString() @Transform(({ value }) => maybeNormalizeString(value)) title?: string;
  @IsOptional() @IsString() @Transform(({ value }) => maybeNormalizeString(value)) description?: string;
  @IsOptional() @IsMongoId() @Transform(({ value }) => maybeNormalizeString(value)) category?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === undefined ? undefined : String(Array.isArray(value) ? value[0] : value).trim()))
  whatYouWillLearn?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === undefined ? undefined : String(Array.isArray(value) ? value[0] : value).trim()))
  location?: string;

  @IsOptional() @IsEnum(ModeOfStudy) modeOfStudy?: ModeOfStudy;

  @IsOptional() @IsInt() @Min(0)
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (Array.isArray(value)) value = value[0];
    const n = parseInt(value as any, 10);
    return Number.isNaN(n) ? undefined : n;
  })
  noOfVacancies?: number;

  @IsOptional() @IsEnum(CourseType)
  type?: CourseType;

  @IsOptional() @IsBoolean() @Transform(({ value }) => toBoolean(value)) status?: boolean;

  @IsOptional() @IsString() @Transform(({ value }) => maybeNormalizeString(value)) duration?: string;
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