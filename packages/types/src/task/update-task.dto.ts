import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

import { Source } from './task.entity';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  listId?: string;

  @IsObject()
  @IsOptional()
  source?: Source;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsArray()
  @IsOptional()
  recurrence?: string[];

  @IsString()
  @IsOptional()
  scheduleText?: string;

  @IsString()
  @IsOptional()
  remindAt?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsOptional()
  pageDescription?: string;
}
