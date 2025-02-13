import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

import { CreateActivityDto } from '../activity/create-activity.dto';

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

  @IsString()
  @IsOptional()
  sourceId?: string;

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

  @IsObject()
  @IsOptional()
  activity?: CreateActivityDto;

  @IsString()
  @IsOptional()
  pageDescription?: string;
}

export class CreateBulkTasksDto {
  tasks: CreateTaskDto[];
}
