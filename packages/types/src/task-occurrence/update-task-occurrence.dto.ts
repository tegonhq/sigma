import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';

import {
  TaskOccurrenceStatusEnum,
  TaskOccurrenceStatusType,
} from './task-occurrence.entity';

export class UpdateTaskOccurenceDTO {
  @IsArray()
  taskOccurrenceIds: string[];

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsOptional()
  @IsEnum(TaskOccurrenceStatusEnum)
  status?: TaskOccurrenceStatusType;
}
