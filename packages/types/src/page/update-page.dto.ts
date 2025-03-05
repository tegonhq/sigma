import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdatePageDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  htmlDescription?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsString()
  @IsOptional()
  sortOrder?: string;

  @IsString()
  @IsOptional()
  archived?: string;
}

export class MoveTaskToPageDto {
  @IsString()
  @IsOptional()
  fromDate?: string;

  @IsString()
  @IsOptional()
  toDate?: string;

  @IsArray()
  taskIds: string[];
}
