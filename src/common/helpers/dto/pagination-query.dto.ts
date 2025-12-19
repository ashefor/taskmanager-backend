// dto/get-tasks-query.dto.ts
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string; // e.g. 'dueDate', 'createdAt'

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsDateString({}, { message: 'start_date must be a valid ISO 8601 date string' })
  start_date?: string;

  @IsOptional()
  @IsDateString({}, { message: 'end_date must be a valid ISO 8601 date string' })
  end_date?: string;
}
