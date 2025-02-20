import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

import { Source } from './task.entity';

export class CreateTaskDto {
  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  status: string;

  @IsString()
  @IsOptional()
  title: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsObject()
  @IsOptional()
  source?: Source;

  @IsString()
  @IsOptional()
  integrationAccountId?: string;

  @IsString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  listId?: string;

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
  pageDescription?: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}

export class CreateBulkTasksDto {
  tasks: CreateTaskDto[];
}
